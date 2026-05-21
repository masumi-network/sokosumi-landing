// Related Agents - Shows 4 random agent cards on agent detail pages
document.addEventListener("DOMContentLoaded", function() {
  // Only run on agent detail pages
  if (!window.location.pathname.includes('/ai-agents/')) return;

  // Get current agent slug from URL
  var pathParts = window.location.pathname.split('/');
  var currentSlug = pathParts[pathParts.length - 1].replace('.html', '').replace(/\/$/, '');

  // Fetch agents data
  fetch('../data/agents.json')
    .then(function(response) { return response.json(); })
    .then(function(agents) {
      // Filter out current agent and get 4 random ones
      var otherAgents = agents.filter(function(agent) {
        return agent.slug !== currentSlug;
      });

      // Shuffle and take 4
      var shuffled = otherAgents.sort(function() { return 0.5 - Math.random(); });
      var selectedAgents = shuffled.slice(0, 4);

      // Create the section HTML
      var sectionHTML = createRelatedAgentsSection(selectedAgents);

      // Insert before footer
      var footer = document.querySelector('.new-footwer');
      if (footer && footer.parentElement) {
        var container = document.createElement('div');
        container.innerHTML = sectionHTML;
        footer.parentElement.insertBefore(container.firstElementChild, footer);
      }
    })
    .catch(function(err) {
      console.log('Could not load related agents:', err);
    });

  function createRelatedAgentsSection(agents) {
    var cardsHTML = agents.map(function(agent) {
      return createAgentCard(agent);
    }).join('');

    // Add responsive styles
    var styleTag = '<style>' +
      '.related-agents-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }' +
      '@media (max-width: 991px) { .related-agents-grid { grid-template-columns: repeat(2, 1fr); } }' +
      '@media (max-width: 479px) { .related-agents-grid { grid-template-columns: 1fr; } }' +
    '</style>';

    return styleTag +
    '<div class="related-agents-section" style="padding: 4rem 0; background-color: #f7f9fb;">' +
      '<div class="container-large" style="max-width: 1200px; margin: 0 auto; padding: 0 1.5rem;">' +
        '<div class="text-center" style="margin-bottom: 2rem; text-align: center;">' +
          '<h2 style="font-size: 1.75rem; font-weight: 600; color: #111;">Explore More Agents</h2>' +
        '</div>' +
        '<div class="related-agents-grid">' +
          cardsHTML +
        '</div>' +
      '</div>' +
    '</div>';
  }

  function createAgentCard(agent) {
    var verifiedBadge = agent.isVerified ?
      '<div class="verified"><div class="icon w-embed"><svg width="89" height="29" viewBox="0 0 89 29" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M0 14.3212C0 6.41184 6.41183 0 14.3212 0H73.7767C81.6861 0 88.0979 6.41184 88.0979 14.3212C88.0979 22.2306 81.6861 28.6425 73.7767 28.6425H14.3212C6.41184 28.6425 0 22.2306 0 14.3212Z" fill="#F0F0F0"/>' +
      '<path d="M14.321 4.54987L21.5209 7.63555V13.9098C21.5209 19.1554 17.8181 22.2411 14.321 24.0925C10.8239 22.2411 7.12109 19.1554 7.12109 13.9098V7.63555L14.321 4.54987Z" stroke="#0F8B46" stroke-width="1.54284"/>' +
      '<path d="M10.9277 14.4241L13.0877 16.5841L17.8191 11.7499" stroke="#0F8B46" stroke-width="1.54284" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M34.2857 9.90443L37.0845 18.0947H37.1974L39.9962 9.90443H41.6363L38.0174 19.9606H36.2645L32.6456 9.90443H34.2857ZM45.465 20.1128C44.7219 20.1128 44.082 19.954 43.5451 19.6365C43.0115 19.3157 42.5991 18.8656 42.3077 18.2862C42.0197 17.7035 41.8756 17.021 41.8756 16.2386C41.8756 15.4661 42.0197 14.7852 42.3077 14.196C42.5991 13.6067 43.005 13.1468 43.5255 12.8162C44.0492 12.4856 44.6614 12.3203 45.3619 12.3203C45.7874 12.3203 46.1999 12.3906 46.5993 12.5314C46.9986 12.6722 47.3571 12.8931 47.6746 13.1943C47.9921 13.4954 48.2426 13.8866 48.4259 14.3678C48.6092 14.8458 48.7008 15.4268 48.7008 16.111V16.6314H42.7055V15.5315H47.2621C47.2621 15.1453 47.1836 14.8032 47.0265 14.5053C46.8693 14.2042 46.6484 13.9668 46.3636 13.7933C46.0821 13.6198 45.7514 13.5331 45.3717 13.5331C44.9593 13.5331 44.5992 13.6346 44.2915 13.8375C43.987 14.0372 43.7513 14.2991 43.5844 14.6232C43.4207 14.944 43.3389 15.2926 43.3389 15.669V16.5283C43.3389 17.0324 43.4273 17.4613 43.604 17.8148C43.7841 18.1683 44.0345 18.4384 44.3553 18.625C44.6761 18.8083 45.0509 18.9 45.4797 18.9C45.758 18.9 46.0117 18.8607 46.2408 18.7821C46.47 18.7003 46.668 18.5792 46.835 18.4188C47.0019 18.2584 47.1296 18.0603 47.218 17.8246L48.6075 18.075C48.4963 18.4842 48.2966 18.8427 48.0085 19.1504C47.7237 19.4548 47.3653 19.6921 46.9332 19.8624C46.5043 20.0293 46.015 20.1128 45.465 20.1128ZM50.3298 19.9606V12.4185H51.7489V13.6166H51.8274C51.9649 13.2106 52.2072 12.8915 52.5541 12.6591C52.9044 12.4234 53.3005 12.3055 53.7424 12.3055C53.8341 12.3055 53.9421 12.3088 54.0665 12.3154C54.1942 12.3219 54.294 12.3301 54.366 12.3399V13.7442C54.3071 13.7279 54.2023 13.7099 54.0518 13.6902C53.9012 13.6673 53.7506 13.6558 53.6 13.6558C53.253 13.6558 52.9437 13.7295 52.672 13.8768C52.4036 14.0208 52.1908 14.2222 52.0337 14.4808C51.8765 14.7361 51.798 15.0274 51.798 15.3548V19.9606H50.3298ZM55.6365 19.9606V12.4185H57.1047V19.9606H55.6365ZM56.378 11.2547C56.1226 11.2547 55.9033 11.1696 55.72 10.9994C55.54 10.8259 55.4499 10.6197 55.4499 10.3807C55.4499 10.1385 55.54 9.93226 55.72 9.76204C55.9033 9.58854 56.1226 9.50179 56.378 9.50179C56.6333 9.50179 56.851 9.58854 57.031 9.76204C57.2144 9.93226 57.306 10.1385 57.306 10.3807C57.306 10.6197 57.2144 10.8259 57.031 10.9994C56.851 11.1696 56.6333 11.2547 56.378 11.2547ZM70.8779 20.1128C70.1348 20.1128 69.4948 19.954 68.958 19.6365C68.4244 19.3157 68.0119 18.8656 67.7206 18.2862C67.4325 17.7035 67.2885 17.021 67.2885 16.2386C67.2885 15.4661 67.4325 14.7852 67.7206 14.196C68.0119 13.6067 68.4178 13.1468 68.9383 12.8162C69.4621 12.4856 70.0742 12.3203 70.7748 12.3203C71.2003 12.3203 71.6128 12.3906 72.0121 12.5314C72.4115 12.6722 72.7699 12.8931 73.0875 13.1943C73.405 13.4954 73.6554 13.8866 73.8387 14.3678C74.0221 14.8458 74.1137 15.4268 74.1137 16.111V16.6314H68.1183V15.5315H72.675C72.675 15.1453 72.5964 14.8032 72.4393 14.5053C72.2822 14.2042 72.0612 13.9668 71.7764 13.7933C71.4949 13.6198 71.1643 13.5331 70.7846 13.5331C70.3721 13.5331 70.012 13.6346 69.7043 13.8375C69.3999 14.0372 69.1642 14.2991 68.9973 14.6232C68.8336 14.944 68.7517 15.2926 68.7517 15.669V16.5283C68.7517 17.0324 68.8401 17.4613 69.0169 17.8148C69.1969 18.1683 69.4474 18.4384 69.7682 18.625C70.089 18.8083 70.4638 18.9 70.8926 18.9C71.1708 18.9 71.4245 18.8607 71.6537 18.7821C71.8828 18.7003 72.0809 18.5792 72.2478 18.4188C72.4148 18.2584 72.5424 18.0603 72.6308 17.8246L74.0204 18.075C73.9091 18.4842 73.7094 18.8427 73.4214 19.1504C73.1366 19.4548 72.7781 19.6921 72.346 19.8624C71.9172 20.0293 71.4278 20.1128 70.8779 20.1128Z" fill="#535352"/>' +
      '</svg></div></div>' : '';

    var starsHTML = '<svg width="80" height="16" viewBox="0 0 80 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M7.83 1.83L9.73 5.67L13.97 6.29L10.9 9.28L11.63 13.5L7.83 11.53L4.05 13.5L4.77 9.28L1.7 6.29L5.94 5.67L7.83 1.83Z" fill="#111"/>' +
      '<path d="M23.5 1.83L25.4 5.67L29.64 6.29L26.57 9.28L27.3 13.5L23.5 11.53L19.72 13.5L20.44 9.28L17.37 6.29L21.61 5.67L23.5 1.83Z" fill="#111"/>' +
      '<path d="M39.17 1.83L41.07 5.67L45.31 6.29L42.24 9.28L42.97 13.5L39.17 11.53L35.39 13.5L36.11 9.28L33.04 6.29L37.28 5.67L39.17 1.83Z" fill="#111"/>' +
      '<path d="M54.84 1.83L56.73 5.67L60.98 6.29L57.91 9.28L58.63 13.5L54.84 11.53L51.05 13.5L51.77 9.28L48.7 6.29L52.95 5.67L54.84 1.83Z" fill="#111"/>' +
      '<path d="M70.51 1.83L72.41 5.67L76.65 6.29L73.58 9.28L74.31 13.5L70.51 11.53L66.73 13.5L67.44 9.28L64.38 6.29L68.62 5.67L70.51 1.83Z" fill="#111"/>' +
      '</svg>';

    // Fix icon path for relative URL
    var iconPath = agent.iconLight.replace('./', '../');

    return '<div class="agent-card-wrapper">' +
      '<a href="./' + agent.slug + '" class="agent-item-wrap w-inline-block" style="display: block; text-decoration: none; color: inherit; background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; height: 100%;">' +
        '<div class="top-content">' +
          '<div class="agent-card-icon-wrap" style="display: flex; justify-content: space-between; align-items: flex-start;">' +
            '<img loading="lazy" src="' + iconPath + '" alt="" style="width: 48px; height: 48px;"/>' +
            verifiedBadge +
          '</div>' +
          '<div style="margin-top: 1rem;">' +
            '<div style="color: ' + agent.colorLight + '; font-size: 1rem; font-weight: 600;">' + agent.name + '</div>' +
          '</div>' +
          '<div style="margin-top: 0.5rem;">' + starsHTML + '</div>' +
          '<div class="agent-content" style="margin-top: 0.75rem;">' +
            '<div style="font-size: 0.875rem; color: #6b7280; line-height: 1.5;">' + agent.shortDescription + '</div>' +
          '</div>' +
        '</div>' +
        '<div style="margin-top: 1rem; font-size: 0.875rem; font-weight: 600; color: #111;">' + agent.credits + ' Credits</div>' +
        '<div style="margin-top: 1rem;">' +
          '<div class="button-black-new secondary-bottun" style="display: inline-block; padding: 0.5rem 1rem; border: 1px solid #111; border-radius: 6px; font-size: 0.875rem;">Show Details</div>' +
        '</div>' +
      '</a>' +
    '</div>';
  }
});
