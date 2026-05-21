// Dropdown and Tab functionality for Webflow-style components with smooth animations
document.addEventListener("DOMContentLoaded", function() {

  // ========== TABS FUNCTIONALITY ==========
  var tabContainers = document.querySelectorAll(".w-tabs");

  tabContainers.forEach(function(tabContainer) {
    var tabMenu = tabContainer.querySelector(".w-tab-menu");
    var tabContent = tabContainer.querySelector(".w-tab-content");

    if (tabMenu && tabContent) {
      var tabLinks = tabMenu.querySelectorAll(".w-tab-link");
      var tabPanes = tabContent.querySelectorAll(".w-tab-pane");

      // Read Webflow data attributes for animation timing
      var durationIn = parseInt(tabContainer.getAttribute("data-duration-in")) || 300;
      var durationOut = parseInt(tabContainer.getAttribute("data-duration-out")) || 100;
      var easing = tabContainer.getAttribute("data-easing") || "ease";

      // Set up initial transitions on tab panes
      tabPanes.forEach(function(pane) {
        pane.style.transition = "opacity " + durationIn + "ms " + easing;
      });

      tabLinks.forEach(function(tabLink) {
        tabLink.addEventListener("click", function(e) {
          e.preventDefault();

          var targetTab = this.getAttribute("data-w-tab");
          var currentTab = tabContainer.getAttribute("data-current");

          if (targetTab === currentTab) return;

          // Remove active class from all tab links
          tabLinks.forEach(function(link) {
            link.classList.remove("w--current");
          });

          // Add active class to clicked tab link
          this.classList.add("w--current");

          // Fade out current pane, then show new pane
          tabPanes.forEach(function(pane) {
            var paneTab = pane.getAttribute("data-w-tab");
            if (paneTab === currentTab) {
              pane.style.transition = "opacity " + durationOut + "ms " + easing;
              pane.style.opacity = "0";
              setTimeout(function() {
                pane.classList.remove("w--tab-active");
                pane.style.display = "none";
              }, durationOut);
            }
          });

          // Show new pane after fade out
          setTimeout(function() {
            tabPanes.forEach(function(pane) {
              var paneTab = pane.getAttribute("data-w-tab");
              if (paneTab === targetTab) {
                pane.style.display = "block";
                pane.style.transition = "opacity " + durationIn + "ms " + easing;
                // Trigger reflow
                pane.offsetHeight;
                pane.classList.add("w--tab-active");
                pane.style.opacity = "1";
              }
            });
          }, durationOut);

          // Update the container's data-current attribute
          tabContainer.setAttribute("data-current", targetTab);
        });
      });
    }
  });

  // ========== DROPDOWNS FUNCTIONALITY ==========
  var dropdowns = document.querySelectorAll(".w-dropdown");

  dropdowns.forEach(function(dropdown) {
    var toggle = dropdown.querySelector(".w-dropdown-toggle");
    var list = dropdown.querySelector(".w-dropdown-list");

    if (toggle && list) {
      // Add transition for smooth animations (don't hide initially - let CSS handle that)
      list.style.transition = "opacity 0.3s ease, transform 0.3s ease";

      // Only set initial hidden state if not already open
      if (!dropdown.classList.contains("w--open")) {
        list.style.opacity = "0";
        list.style.transform = "translateY(-10px)";
      }

      function openDropdown(dropdown, list) {
        dropdown.classList.add("w--open");
        list.classList.add("w--open");
        list.style.display = "block";
        // Trigger reflow for animation
        list.offsetHeight;
        list.style.opacity = "1";
        list.style.transform = "translateY(0)";
      }

      function closeDropdown(dropdown, list) {
        dropdown.classList.remove("w--open");
        list.classList.remove("w--open");
        list.style.opacity = "0";
        list.style.transform = "translateY(-10px)";
        setTimeout(function() {
          if (!dropdown.classList.contains("w--open")) {
            list.style.display = "none";
          }
        }, 300);
      }

      function closeOtherDropdowns(currentDropdown) {
        dropdowns.forEach(function(other) {
          if (other !== currentDropdown) {
            var otherList = other.querySelector(".w-dropdown-list");
            if (otherList && other.classList.contains("w--open")) {
              closeDropdown(other, otherList);
            }
          }
        });
      }

      // Click handler
      toggle.addEventListener("click", function(e) {
        e.preventDefault();
        e.stopPropagation();

        closeOtherDropdowns(dropdown);

        var isOpen = dropdown.classList.contains("w--open");
        if (isOpen) {
          closeDropdown(dropdown, list);
        } else {
          openDropdown(dropdown, list);
        }
      });

      // Hover handlers for desktop
      var hoverTimeout;
      dropdown.addEventListener("mouseenter", function() {
        if (window.innerWidth > 991) {
          clearTimeout(hoverTimeout);
          closeOtherDropdowns(dropdown);
          openDropdown(dropdown, list);
        }
      });

      dropdown.addEventListener("mouseleave", function() {
        if (window.innerWidth > 991) {
          hoverTimeout = setTimeout(function() {
            closeDropdown(dropdown, list);
          }, 100);
        }
      });
    }
  });

  // Close dropdowns when clicking outside
  document.addEventListener("click", function(e) {
    if (!e.target.closest(".w-dropdown")) {
      dropdowns.forEach(function(dropdown) {
        var list = dropdown.querySelector(".w-dropdown-list");
        if (list && dropdown.classList.contains("w--open")) {
          dropdown.classList.remove("w--open");
          list.classList.remove("w--open");
          list.style.opacity = "0";
          list.style.transform = "translateY(-10px)";
          setTimeout(function() {
            if (!dropdown.classList.contains("w--open")) {
              list.style.display = "none";
            }
          }, 300);
        }
      });
    }
  });
});
