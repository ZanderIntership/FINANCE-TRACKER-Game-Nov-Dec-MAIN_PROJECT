// If the page was opened via Live Server (default port 5500) the root-relative links
// will stay on that origin and break extensionless routes. Redirect to the Node
// backend at port 5000 when we detect the Live Server origin.
(function(){
  // Only redirect Live Server origins (5500/5501) to the Node backend if the
  // Node server responds to a short health check. This avoids breaking the
  // Live Server preview when Node isn't running.
  try{
    const p = window.location.port;
    if (p === '5500' || p === '5501'){
      const targetOrigin = 'http://localhost:5000';
      const target = `${targetOrigin}${window.location.pathname}${window.location.search}${window.location.hash}`;
      // quick fetch with timeout
      const controller = new AbortController();
      const timeout = setTimeout(()=>controller.abort(), 800);
      fetch(`${targetOrigin}/api/metrics`, {method:'GET', signal: controller.signal, mode:'cors'}).then(res=>{
        clearTimeout(timeout);
        if (res && res.ok){
          // only redirect if origins differ
          if (window.location.origin !== (new URL(target)).origin) {
            window.location.replace(target);
          }
        }
      }).catch(()=>{/* don't redirect if fetch fails */});
    }
  }catch(e){/* silent */}
})();
