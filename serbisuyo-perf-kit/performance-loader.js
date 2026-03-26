/**
 * Serbisuyo Performance Loader
 * Optimizes critical rendering path, lazy loads content, and improves Core Web Vitals
 *
 * Features:
 * - Critical CSS inlining with deferred non-critical CSS
 * - Preconnect and DNS prefetch to CDNs
 * - Lazy loading for below-fold content
 * - Base64 image optimization
 * - Deferred JS execution with requestIdleCallback
 * - Virtual scrolling for service grids
 * - Service Worker registration
 */

(function() {
  'use strict';

  const CONFIG = {
    criticalCSSId: 'critical-css',
    deferredCSSId: 'deferred-css',
    serviceWorkerPath: '/sw.js',
    preconnectHosts: [
      'https://cdnjs.cloudflare.com',
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ],
    dnsPrefetchHosts: [
      'https://cdnjs.cloudflare.com',
      'https://fonts.googleapis.com'
    ],
    lazyLoadThreshold: '50px'
  };

  // 1. Resource Hints - Preconnect and DNS Prefetch
  function setupResourceHints() {
    CONFIG.preconnectHosts.forEach(host => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = host;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    CONFIG.dnsPrefetchHosts.forEach(host => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = host;
      document.head.appendChild(link);
    });

    // Prefetch manifest and service worker
    const manifestLink = document.createElement('link');
    manifestLink.rel = 'prefetch';
    manifestLink.href = '/manifest.json';
    document.head.appendChild(manifestLink);
  }

  // 2. Deferred CSS Loading
  function loadDeferredCSS() {
    const deferredStyle = document.getElementById(CONFIG.deferredCSSId);
    if (!deferredStyle) return;

    // Mark as loaded once the page is interactive
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        deferredStyle.setAttribute('data-loaded', 'true');
      });
    } else {
      deferredStyle.setAttribute('data-loaded', 'true');
    }
  }

  // 3. Lazy Load Below-Fold Content with IntersectionObserver
  function setupLazyLoading() {
    const lazyElements = document.querySelectorAll('[data-lazy]');

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;

            if (element.tagName === 'IMG') {
              element.src = element.dataset.src;
              element.removeAttribute('data-lazy');
              observer.unobserve(element);
            } else if (element.dataset.lazyContent) {
              loadContent(element);
              observer.unobserve(element);
            }
          }
        });
      }, {
        rootMargin: CONFIG.lazyLoadThreshold
      });

      lazyElements.forEach(el => observer.observe(el));
    } else {
      // Fallback for browsers without IntersectionObserver
      lazyElements.forEach(el => {
        if (el.tagName === 'IMG') {
          el.src = el.dataset.src;
        } else if (el.dataset.lazyContent) {
          loadContent(el);
        }
      });
    }
  }

  // 4. Load Lazy Content
  function loadContent(element) {
    const contentUrl = element.dataset.lazyContent;
    if (!contentUrl) return;

    fetch(contentUrl)
      .then(response => response.text())
      .then(html => {
        element.innerHTML = html;
        element.removeAttribute('data-lazy-content');
      })
      .catch(error => {
        console.warn('Failed to load lazy content:', error);
      });
  }

  // 5. Base64 Image Optimization - Convert to Blob URLs on Demand
  function optimizeBase64Images() {
    const base64Images = document.querySelectorAll('img[src^="data:image/"]');

    base64Images.forEach(img => {
      try {
        // Don't re-process if already converted
        if (img.dataset.optimized) return;

        const src = img.src;
        const blob = dataURItoBlob(src);
        const blobUrl = URL.createObjectURL(blob);

        // Preload the blob
        const preloadLink = document.createElement('link');
        preloadLink.rel = 'preload';
        preloadLink.as = 'image';
        preloadLink.href = blobUrl;
        document.head.appendChild(preloadLink);

        // Replace with blob URL (better memory usage)
        img.src = blobUrl;
        img.dataset.optimized = 'true';
      } catch (error) {
        console.warn('Failed to optimize base64 image:', error);
      }
    });
  }

  // 6. Convert Data URI to Blob
  function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].match(/:(.*?);/)[1];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }

  // 7. Defer Non-Critical JavaScript
  function deferNonCriticalJS() {
    const deferScripts = document.querySelectorAll('script[data-defer]');

    if ('requestIdleCallback' in window) {
      deferScripts.forEach(script => {
        requestIdleCallback(() => {
          executeScript(script);
        }, { timeout: 2000 });
      });
    } else {
      // Fallback to setTimeout
      deferScripts.forEach((script, index) => {
        setTimeout(() => {
          executeScript(script);
        }, 100 * (index + 1));
      });
    }
  }

  // 8. Execute Deferred Script
  function executeScript(scriptElement) {
    const newScript = document.createElement('script');
    if (scriptElement.src) {
      newScript.src = scriptElement.src;
      newScript.async = true;
    } else {
      newScript.textContent = scriptElement.textContent;
    }
    document.body.appendChild(newScript);
  }

  // 9. Virtual Scrolling for Service Grid
  function setupVirtualScrolling() {
    const container = document.querySelector('[data-virtual-scroll]');
    if (!container) return;

    let itemHeight = 300; // Adjust based on your grid item height
    let visibleItems = Math.ceil(container.clientHeight / itemHeight);
    let scrollTop = 0;
    let allItems = [];

    function updateVirtualScroll() {
      scrollTop = container.scrollTop;
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleItems + 1, allItems.length);

      allItems.forEach((item, index) => {
        if (index >= startIndex && index < endIndex) {
          item.style.display = 'block';
          item.style.transform = `translateY(${index * itemHeight}px)`;
        } else {
          item.style.display = 'none';
        }
      });
    }

    // Initialize
    allItems = Array.from(container.querySelectorAll('[data-item]'));
    container.addEventListener('scroll', updateVirtualScroll, { passive: true });
    updateVirtualScroll();
  }

  // 10. Service Worker Registration
  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register(CONFIG.serviceWorkerPath)
          .then(registration => {
            console.log('ServiceWorker registration successful:', registration.scope);

            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60000); // Every 60 seconds
          })
          .catch(error => {
            console.warn('ServiceWorker registration failed:', error);
          });
      });
    }
  }

  // 11. Core Web Vitals Monitoring
  function monitorCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              console.log('CLS:', clsValue);
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }

    // First Input Delay (FID) / Interaction to Next Paint (INP)
    if ('PerformanceObserver' in window) {
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            console.log('FID/INP:', entry.processingDuration);
          });
        });
        fidObserver.observe({ entryTypes: ['first-input', 'interaction'] });
      } catch (e) {
        console.warn('FID/INP observer not supported');
      }
    }
  }

  // 12. Optimize Font Loading
  function optimizeFontLoading() {
    // Add font-display: swap for better FOUT/FOIT handling
    const fontLinks = document.querySelectorAll('link[href*="fonts.googleapis.com"]');
    fontLinks.forEach(link => {
      if (!link.href.includes('display=swap')) {
        link.href += (link.href.includes('?') ? '&' : '?') + 'display=swap';
      }
    });

    // Preload critical fonts
    const criticalFont = document.createElement('link');
    criticalFont.rel = 'preload';
    criticalFont.as = 'font';
    criticalFont.href = 'https://fonts.gstatic.com/s/plusjakartasans/v8/..../font.woff2';
    criticalFont.type = 'font/woff2';
    criticalFont.crossOrigin = 'anonymous';
    // Only add if font URL is known
    // document.head.appendChild(criticalFont);
  }

  // 13. Intersection Observer for Analytics
  function setupAnalyticsTracking() {
    const trackableElements = document.querySelectorAll('[data-track]');

    if ('IntersectionObserver' in window) {
      const tracker = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const trackingId = element.dataset.track;

            // Send analytics event (implement with your analytics library)
            if (window.gtag) {
              window.gtag('event', 'section_view', {
                section_id: trackingId
              });
            }

            tracker.unobserve(element);
          }
        });
      }, { threshold: 0.25 });

      trackableElements.forEach(el => tracker.observe(el));
    }
  }

  // 14. Initialize All Optimizations
  function initialize() {
    // Critical path optimizations (synchronous)
    setupResourceHints();
    loadDeferredCSS();
    optimizeBase64Images();
    optimizeFontLoading();

    // Post-render optimizations
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setupLazyLoading();
        deferNonCriticalJS();
        setupVirtualScrolling();
        registerServiceWorker();
        monitorCoreWebVitals();
        setupAnalyticsTracking();
      });
    } else {
      setupLazyLoading();
      deferNonCriticalJS();
      setupVirtualScrolling();
      registerServiceWorker();
      monitorCoreWebVitals();
      setupAnalyticsTracking();
    }
  }

  // Start optimization process
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Export for debugging
  window.SerbisuoPerformance = {
    config: CONFIG,
    optimizeBase64Images,
    setupLazyLoading,
    monitorCoreWebVitals
  };
})();
