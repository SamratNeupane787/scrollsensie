import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const script = `(() => {
    const QP_ID = new URLSearchParams(location.search).get('id');
    const ATTR_ID = document.currentScript && document.currentScript.getAttribute('data-id');
    const SCRIPT_ID = (function() {
      try {
        const current = document.currentScript && document.currentScript.src;
        return current ? new URLSearchParams(new URL(current).search).get('id') : null;
      } catch(e) { return null; }
    })();
    const TRACKER_ID = QP_ID || ATTR_ID || SCRIPT_ID || '';
    if (!TRACKER_ID) {
      console.warn('[scrolltracker] missing tracker id');
      return;
    }

    const ENDPOINT = (function() {
      try {
        const current = document.currentScript && document.currentScript.src ? new URL(document.currentScript.src) : null;
        const origin = current ? current.origin : window.location.origin;
        return new URL('/api/track', origin).toString();
      } catch(e) { return '/api/track'; }
    })();

    let maxDepth = 0;
    let ticking = false;
    const MILESTONES = [25, 50, 75, 100];
    const fired = new Set();
    
    // Engagement tracking
    const startTime = Date.now();
    let lastScrollTime = startTime;
    let scrollEvents = [];
    let isPageActive = true;

    function getScrollDepth() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      const docHeight = Math.max(
        document.body.scrollHeight, document.documentElement.scrollHeight,
        document.body.offsetHeight, document.documentElement.offsetHeight,
        document.body.clientHeight, document.documentElement.clientHeight
      );
      const winHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      const total = Math.max(docHeight - winHeight, 1);
      const depth = Math.min(100, Math.round((scrollTop / total) * 100));
      return depth;
    }

    function post(depth, milestone, isFinal = false) {
      try {
        const currentTime = Date.now();
        const timeOnPage = currentTime - startTime;
        
        // Track scroll events for engagement analysis
        scrollEvents.push({
          depth: depth,
          timestamp: currentTime,
          timeOnPage: timeOnPage
        });
        
        const payload = {
          trackerId: TRACKER_ID,
          scrollDepth: depth,
          pageUrl: window.location.href,
          timestamp: currentTime,
          timeOnPage: timeOnPage,
          // Always include engagement data for milestone events (25%, 50%, 75%, 100%)
          ...(milestone !== undefined ? {
            totalTimeOnPage: timeOnPage,
            maxScrollDepth: maxDepth,
            scrollEvents: scrollEvents.length,
            engagement: {
              timeOnPage: timeOnPage,
              maxDepth: maxDepth,
              scrollEvents: scrollEvents.length,
              avgScrollSpeed: scrollEvents.length > 1 ? timeOnPage / scrollEvents.length : 0
            }
          } : {}),
          device: {
            ua: navigator.userAgent,
            width: window.innerWidth,
            height: window.innerHeight
          }
        };
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 3000);
        fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
          signal: controller.signal
        }).catch(() => {});
        if (milestone !== undefined) {
          try { window.dispatchEvent(new CustomEvent('scrolltracker:milestone', { detail: { milestone, depth } })); } catch(e) {}
        }
      } catch (e) { /* noop */ }
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const depth = getScrollDepth();
        if (depth > maxDepth) {
          maxDepth = depth;
          post(maxDepth);
          for (const m of MILESTONES) {
            if (maxDepth >= m && !fired.has(m)) {
              fired.add(m);
              post(maxDepth, m, true); // Include engagement data for milestones
            }
          }
        }
        ticking = false;
      });
    }

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      isPageActive = !document.hidden;
    });
    
    // Send final engagement data when user leaves
    window.addEventListener('beforeunload', () => {
      const finalTime = Date.now();
      const totalTimeOnPage = finalTime - startTime;
      
      // Calculate engagement metrics
      const engagementData = {
        trackerId: TRACKER_ID,
        pageUrl: window.location.href,
        timestamp: finalTime,
        totalTimeOnPage: totalTimeOnPage,
        maxScrollDepth: maxDepth,
        scrollEvents: scrollEvents.length,
        engagement: {
          timeOnPage: totalTimeOnPage,
          maxDepth: maxDepth,
          scrollEvents: scrollEvents.length,
          avgScrollSpeed: scrollEvents.length > 1 ? totalTimeOnPage / scrollEvents.length : 0
        }
      };
      
      // Send final engagement data
      navigator.sendBeacon(ENDPOINT, JSON.stringify(engagementData));
    });

    post(0);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    document.addEventListener('readystatechange', () => { if (document.readyState === 'complete') onScroll(); });
  })();`;

  return new NextResponse(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=300",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
