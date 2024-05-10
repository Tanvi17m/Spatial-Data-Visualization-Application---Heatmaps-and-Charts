import { tip } from "@/javascripts/SpatialGraphSVGEditing_2";
import {
  updateTooltipPositions,
  activityTooltip as activity_tooltip,
  hideTooltipsExcept,
} from "@/javascripts/tooltips.js";
import { eventBus } from "@/javascripts/eventBus";

const configurations = {
  1: {
    zIndex: 15,
    offsetY: 0,
    widthSettings: [
      { minWidth: 993, offsetZ: 270, offsetX: -65, scale: 0.9 },
      { minWidth: 769, offsetZ: 100, offsetX: -50, scale: 1 },
      { minWidth: 0, offsetZ: 120, offsetX: -80, scale: 1 },
    ],
  },
  2: {
    zIndex: 14,
    offsetY: 0,
    widthSettings: [
      { minWidth: 993, offsetZ: 100, offsetX: -30, scale: 0.9 },
      { minWidth: 769, offsetZ: 40, offsetX: -50, scale: 1 },
      { minWidth: 0, offsetZ: 50, offsetX: -80, scale: 1 },
    ],
  },
  3: {
    zIndex: 13,
    offsetY: 0,
    widthSettings: [
      { minWidth: 993, offsetZ: -90, offsetX: 10, scale: 0.9 },
      { minWidth: 769, offsetZ: -20, offsetX: -50, scale: 1 },
      { minWidth: 0, offsetZ: -30, offsetX: -80, scale: 1 },
    ],
  },
  4: {
    zIndex: 12,
    offsetY: 0,
    widthSettings: [
      { minWidth: 993, offsetZ: -540, offsetX: 100, scale: 0.9 },
      { minWidth: 769, offsetZ: -220, offsetX: -50, scale: 1 },
      { minWidth: 0, offsetZ: -180, offsetX: -80, scale: 1 },
    ],
  },
};

const tooltipPositions = {
  large: { top: [135, 285, 435, 585], left: 965 },
  medium: { top: [145, 200, 255, 310], left: 620 },
  small: { top: [70, 135, 200, 265], left: 340 },
};

const interactingStates = new Map();
let selectedContainer = "visualization-container1";
let viewportWidth = window.innerWidth;
let hovering = false;
let isMouseDownEventActive = false;

function addPanningAndZoomingToContainer(containerId) {
  const container = document.getElementById(containerId);
  const parentElement = container.parentElement;

  //container.style.transform = `perspective(1000px) scale(0.95)`;
  let isPanning = false;
  let isResetMode = true;
  
  let startX;
  let startY;
  let rotateX = 0;
  let rotateY = 0;
  let rotateZ = 0;
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;
  let offsetZ = 0;
  let currentMode = "rotate"; // Default to rotation

  const updateTransform = () => {
    tip.style("visibility", "hidden");
    container.style.transform = `perspective(1000px) translate3d(${offsetX}px, ${offsetY}px, ${offsetZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) scale(${scale})`;
    delayedUpdateTooltips(0, containerId);
  };

  function delayedUpdateTransform(delay) {
    setTimeout(() => {
      tip.style("visibility", "hidden");
      container.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translate3d(${offsetX}px, ${offsetY}px, ${offsetZ}px) scale(${scale})`;
      delayedUpdateTooltips(500, containerId);
    }, delay);
  }

  function delayedUpdateTooltips(delay, containerId) {
    setTimeout(() => {
      updateTooltipPositions(containerId);
    }, delay);
  }

  const startInteraction = (event, clientX, clientY) => {
    isPanning = true;
    isMouseDownEventActive = true;

    const numberPart = containerId.slice("visualization-container".length);

    interactingStates.set(containerId, true);
    startX = clientX;
    startY = clientY;
    container.style.transition = "none";
    container.style.cursor = "grabbing";
    container.style.zIndex = 17;
    if( isResetMode ){
      (offsetX = 0), (offsetY = 0), (offsetZ = 0);
      if( numberPart == 4){
        offsetY = 140
      }
      rotateX = 0;
      rotateY = 0;
      rotateZ = 0;
    }
    isResetMode = false;
    updateTransform();
    d3.select(`#floorTooltip1`).style("visibility", "hidden");
    d3.select(`#floorTooltip2`).style("visibility", "hidden");
    d3.select(`#floorTooltip3`).style("visibility", "hidden");
    d3.select(`#floorTooltip4`).style("visibility", "hidden");
    selectedContainer = container.id;
    if( activity_tooltip == true ){
        hideTooltipsExcept(selectedContainer);
    }
  
    eventBus.emit("changeGraphs", { containerId: containerId.slice("visualization-container".length) });
  
    console.log(event.isFloorChanged);
    if( event.isFloorChanged ){
          viewportWidth = window.innerWidth;
         
          let container_;
          for (var i = 1; i <= 4; i++) {
            if (i != numberPart) {
              container_ = document.getElementById(
                `visualization-container${i}`
              );
              container_.style.visibility = "hidden";
              d3.select(`#floorTooltip${i}`).style("visibility", "hidden");
            } else {
              if (viewportWidth >= 992) {
                d3.select(`#floorTooltip${i}`)
                  .style("top", "20px")
                  .style("left", "500px")
                  .style("visibility", "visible");
              } else if (viewportWidth >= 768) {
                d3.select(`#floorTooltip${i}`)
                  .style("top", "17px")
                  .style("left", "375px")
                  .style("visibility", "visible");
              } else {
                d3.select(`#floorTooltip${i}`)
                  .style("top", "15px")
                  .style("left", "200px")
                  .style("visibility", "visible");
              }
            }
          }

          selectedContainer = container.id;
          //console.log(selectedContainer);
          if (activity_tooltip == true) {
            hideTooltipsExcept(selectedContainer);
          }
    }
    // console.log(selectedContainer);
    // if (activity_tooltip == true) {
    //   var centroids = document.querySelectorAll(".centroid");
    //   centroids.forEach((centroid) => {
    //     const rect = centroid.getBoundingClientRect();

    //     var centroid_id = centroid.id;

    //     const regex = /tcs_(\d+)[fF]_/i;
    //     const match = centroid_id.match(regex);
    //     var floorNumber = match ? parseInt(match[1], 10) : null;

    //     const numberPart = selectedContainer.slice(
    //       "visualization-container".length
    //     );
    //     if (floorNumber != numberPart) {
    //       const tooltipId = `tooltip-for-${centroid_id}`;
    //       const tooltip = d3.select(`#${tooltipId}`);
    //       tooltip.style("visibility", "hidden");
    //       d3.select(centroid).style("fill", "none");
    //     } else {
    //       const tooltipId = `tooltip-for-${centroid_id}`;
    //       const tooltip = d3.select(`#${tooltipId}`);
    //       tooltip.style("visibility", "visible");
    //       d3.select(centroid).style("fill", "black");
    //     }
    //   });
    // }
  };

  const onMove = (clientX, clientY) => {
    //console.log(isPanning)
    if (!isPanning) return;

    eventBus.emit("enableButtons");
     if (currentMode === "rotate") {
        const rotateButton = parentElement.querySelector(`#rotate`);
        const translateButton = parentElement.querySelector(`#translate`);
        
        rotateButton.classList.remove("button-active");
        translateButton.classList.remove("button-active");

        rotateButton.classList.add("button-active");
     } else if (currentMode === "translate") {
        const rotateButton = parentElement.querySelector(`#rotate`);
        const translateButton = parentElement.querySelector(`#translate`);

        rotateButton.classList.remove("button-active");
        translateButton.classList.remove("button-active");

        translateButton.classList.add("button-active");
     }
    //container.style.zIndex += 5;
    viewportWidth = window.innerWidth;

    const numberPart = containerId.slice("visualization-container".length);
    let container_;
    for (var i = 1; i <= 4; i++) {
      if (i != numberPart) {
        container_ = document.getElementById(`visualization-container${i}`);
        container_.style.visibility = "hidden";
        d3.select(`#floorTooltip${i}`).style("visibility", "hidden");
      } else {
        if (viewportWidth >= 992) {
          d3.select(`#floorTooltip${i}`)
            .style("top", "20px")
            .style("left", "500px")
            .style("visibility", "visible");
        } else if (viewportWidth >= 768) {
          d3.select(`#floorTooltip${i}`)
            .style("top", "17px")
            .style("left", "375px")
            .style("visibility", "visible");
        } else {
          d3.select(`#floorTooltip${i}`)
            .style("top", "15px")
            .style("left", "200px")
            .style("visibility", "visible");
        }
      }
    }

    selectedContainer = container.id;
    //console.log(selectedContainer);
    if (activity_tooltip == true) {
      hideTooltipsExcept(selectedContainer)
    }

    const deltaX = clientX - startX;
    const deltaY = clientY - startY;

    if (currentMode === "rotate") {
      rotateZ -= deltaX * 0.2;
      rotateX = Math.max(0, Math.min(100, rotateX - deltaY * 0.2));
    } else if (currentMode === "translate") {
      offsetX += deltaX;
      offsetY += deltaY;
    }
    updateTransform();
    startX = clientX;
    startY = clientY;

  };

  const endInteraction = () => {
    isPanning = false;
    // container.style.transition = "transform 0.1s";
    container.style.cursor = "auto";
  };

  const applyZoom = (delta) => {
    scale = Math.min(Math.max(0.125, scale + delta), 4);
    if (containerId == selectedContainer) {
      updateTransform();
    } else {
      let container_ = document.getElementById(containerId);
      container_.style.visibility = "hidden";
    }
    d3.select(`#floorTooltip1`).style("visibility", "hidden");
    d3.select(`#floorTooltip2`).style("visibility", "hidden");
    d3.select(`#floorTooltip3`).style("visibility", "hidden");
    d3.select(`#floorTooltip4`).style("visibility", "hidden");
  };

  function setupHoverListeners() {
    container.addEventListener("mouseenter", function (event) {
      if (
        event.target === event.currentTarget &&
        !interactingStates.get(containerId) &&
        !hovering &&
        !isMouseDownEventActive
      ) {
        viewportWidth = window.innerWidth;
        rotateX = 60;
        rotateY = 0;
        rotateZ = -45;
        //  container.style.transition = "transform 0.2s ease-out";
        container.style.zIndex = 17;

        const numberPart = containerId.slice("visualization-container".length);
        let container_, floorTooltip;
        let local_offsetX = 0,
          local_offsetY = 0,
          local_offsetZ = 0,
          scale = 1;
        for (var i = 1; i <= 4; i++) {
          container_ = document.getElementById(`visualization-container${i}`);
          container_.style.transition = "transform 0.2s ease-out";
          floorTooltip = document.getElementById(`floorTooltip${i}`);
          // console.log(container_.style.transform);
          if (i < numberPart) {
            // local_offsetZ = translateValues.translateZ + 100;
            const config = configurations[i] || configurations[1]; // Fallback to config 1 if undefined

            const { zIndex, widthSettings } = config;

            const setting = widthSettings.find(
              (s) => viewportWidth >= s.minWidth
            );

            local_offsetX = setting.offsetX;
            local_offsetY = config.offsetY;
            local_offsetZ = setting.offsetZ + 120;
            scale = setting.scale;
            container_.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translate3d(${local_offsetX}px, ${local_offsetY}px, ${local_offsetZ}px) scale(${scale})`;
            floorTooltip.style.transform = `translateY(-110px)`;
          } else if (i > numberPart) {
            const config = configurations[i] || configurations[1];

            const { zIndex, widthSettings } = config;

            const setting = widthSettings.find(
              (s) => viewportWidth >= s.minWidth
            );

            local_offsetX = setting.offsetX;
            local_offsetY = config.offsetY;
            local_offsetZ = setting.offsetZ - 150;
            scale = setting.scale;
            container_.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translate3d(${local_offsetX}px, ${local_offsetY}px, ${local_offsetZ}px) scale(${scale})`;
            floorTooltip.style.transform = `translateY(110px)`;
          }
          delayedUpdateTooltips(200, `visualization-container${i}`);
        }
        //  delayedUpdateTransform(50);
      }
      hovering = true;
    });

    container.addEventListener("mouseleave", function (event) {
      if (
        event.target === event.currentTarget &&
        !interactingStates.get(containerId) &&
        hovering &&
        !isMouseDownEventActive
      ) {
        rotateX = 60;
        rotateY = 0;
        rotateZ = -45;
        //  container.style.transition = "transform 0.5s ease-out";
        const numberPart = containerId.slice("visualization-container".length);
        viewportWidth = window.innerWidth;

        const config = configurations[numberPart] || configurations[1]; // Fallback to config 1 if undefined

        const { zIndex, widthSettings } = config;

        const setting = widthSettings.find((s) => viewportWidth >= s.minWidth);

        offsetX = setting.offsetX;
        offsetY = config.offsetY;
        offsetZ = setting.offsetZ;
        container.style.zIndex = zIndex;
        let container_, floorTooltip;
        let local_offsetX = 0,
          local_offsetY = 0,
          local_offsetZ = 0,
          scale = 1;
        //   delayedUpdateTransform(50);
        for (var i = 1; i <= 4; i++) {
          container_ = document.getElementById(`visualization-container${i}`);
          // console.log(container_.style.transform);
          // local_offsetZ = translateValues.translateZ + 100;
          const config = configurations[i] || configurations[1]; // Fallback to config 1 if undefined

          const { zIndex, widthSettings } = config;

          const setting = widthSettings.find(
            (s) => viewportWidth >= s.minWidth
          );

          local_offsetX = setting.offsetX;
          local_offsetY = config.offsetY;
          local_offsetZ = setting.offsetZ;
          scale = setting.scale;
          container_.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translate3d(${local_offsetX}px, ${local_offsetY}px, ${local_offsetZ}px) scale(${scale})`;
          delayedUpdateTooltips(200, `visualization-container${i}`);
        }
     const positions = tooltipPositions['large'];

     positions.top.forEach((topValue, index) => {
       const tooltipId = `#floorTooltip${index + 1}`;
       d3.select(tooltipId)
         .style("top", `${topValue}px`)
         .style("left", `${positions.left}px`)
         .style("transform", "translateY(0px)");
     });
      }
      hovering = false;
    });
  }
  function setupTouchListeners(){
  let lastTapTime = 0;
  const doubleTapThreshold = 300; // Time threshold to distinguish single and double taps
  let singleTapTimeout = null;
  let startX = 0;
  let startY = 0;
  let moving = false;

  function handleSingleTap(e, x, y) {
    console.log("Single tap at:", x, y);
    rotateX = 60;
    rotateY = 0;
    rotateZ = -45;
    //  container.style.transition = "transform 0.2s ease-out";
    const numberPart = containerId.slice("visualization-container".length);

    let container_, floorTooltip;
    let local_offsetX = 0,
      local_offsetY = 0,
      local_offsetZ = 0,
      scale = 1;

    for (var i = 1; i <= 4; i++) {
      container_ = document.getElementById(`visualization-container${i}`);
      const config = configurations[i] || configurations[1];
      const { zIndex, widthSettings } = config;

      const setting = widthSettings.find((s) => viewportWidth >= s.minWidth);
      container_.style.zIndex = zIndex;
      local_offsetX = setting.offsetX;
      local_offsetY = config.offsetY;
      local_offsetZ = setting.offsetZ;
      scale = setting.config
      container_.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translate3d(${local_offsetX}px, ${local_offsetY}px, ${local_offsetZ}px) scale(${scale})`;
      delayedUpdateTooltips(200, `visualization-container${i}`);
    }
    container.style.zIndex = 17;
    let position;
    if (viewportWidth >= 992) {
      position = tooltipPositions.large;
    } else if (viewportWidth >= 768) {
      position = tooltipPositions.medium;
    } else {
      position = tooltipPositions.small;
    }

    position.top.forEach((top, index) => {
      const tooltipId = `#floorTooltip${index + 1}`;
      d3.select(tooltipId)
        .style("top", `${top}px`)
        .style("left", `${position.left}px`)
        .style("transform", `translateY(0px)`);
    });

    for (var i = 1; i <= 4; i++) {
      container_ = document.getElementById(`visualization-container${i}`);
      container_.style.transition = "transform 0.2s ease-out";
      floorTooltip = document.getElementById(`floorTooltip${i}`);
      // console.log(container_.style.transform);
      if (i < numberPart) {
        // local_offsetZ = translateValues.translateZ + 100;
        const config = configurations[i] || configurations[1]; // Fallback to config 1 if undefined

        const { zIndex, widthSettings } = config;

        const setting = widthSettings.find((s) => viewportWidth >= s.minWidth);

        local_offsetX = setting.offsetX;
        local_offsetY = config.offsetY;
        scale = setting.scale;
        if (viewportWidth < 768) {
          local_offsetZ = setting.offsetZ + 50;
          floorTooltip.style.transform = `translateY(-50px)`;
        } else {
          local_offsetZ = setting.offsetZ + 100;
          floorTooltip.style.transform = `translateY(-100px)`;
        }

        container_.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translate3d(${local_offsetX}px, ${local_offsetY}px, ${local_offsetZ}px) scale(${scale})`;
      } else if (i > numberPart) {
        const config = configurations[i] || configurations[1];

        const { zIndex, widthSettings } = config;

        const setting = widthSettings.find((s) => viewportWidth >= s.minWidth);

        local_offsetX = setting.offsetX;
        local_offsetY = config.offsetY;
        scale = setting.scale
        if (viewportWidth < 768) {
          local_offsetZ = setting.offsetZ - 75;
          floorTooltip.style.transform = `translateY(75px)`;
        } else {
          local_offsetZ = setting.offsetZ - 150;
          floorTooltip.style.transform = `translateY(120px)`;
        }

        container_.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translate3d(${local_offsetX}px, ${local_offsetY}px, ${local_offsetZ}px) scale(${scale})`;
      }
      delayedUpdateTooltips(200, `visualization-container${i}`);
    }
  }

  function handleDoubleTap(e, x, y) {
    console.log("Double tap at:", x, y);

    let container_;
    let local_offsetX = 0,
      local_offsetY = 0,
      local_offsetZ = 0,
      scale = 1;

    for (var i = 1; i <= 4; i++) {
      container_ = document.getElementById(`visualization-container${i}`);
      const config = configurations[i] || configurations[1];
      const { zIndex, widthSettings } = config;

      const setting = widthSettings.find((s) => viewportWidth >= s.minWidth);
      container_.style.zIndex = zIndex;
      local_offsetX = setting.offsetX;
      local_offsetY = config.offsetY;
      local_offsetZ = setting.offsetZ;
      scale = setting.config;
      container_.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translate3d(${local_offsetX}px, ${local_offsetY}px, ${local_offsetZ}px) scale(${scale})`;
      delayedUpdateTooltips(200, `visualization-container${i}`);
    }

    container.style.zIndex = 17;
    startInteraction(e, x, y); // Start interaction with double tap
  }

  container.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;

        const currentTime = new Date().getTime();
        if (singleTapTimeout) clearTimeout(singleTapTimeout);

        if (currentTime - lastTapTime <= doubleTapThreshold && !moving) {
          handleDoubleTap(e, startX, startY);
          moving = false;
          singleTapTimeout = null;
        } else {
          singleTapTimeout = setTimeout(() => {
            if (!moving) handleSingleTap(e, startX, startY);
          }, doubleTapThreshold);
        }
        lastTapTime = currentTime;
      }
    },
    { passive: false }
  );

  container.addEventListener(
    "touchmove",
    (e) => {
      if (e.touches.length === 1) {
        e.preventDefault();
        const touch = e.touches[0];
        const clientX = touch.clientX;
        const clientY = touch.clientY;

        if (
          !moving &&
          (Math.abs(clientX - startX) > 10 || Math.abs(clientY - startY) > 10)
        ) {
          moving = true;
          startInteraction(e, startX, startY); // Start moving interaction with initial touch start
        }

        if (moving) {
          //console.log("Moving:", clientX, clientY);
          onMove(clientX, clientY); // Call onMove only if moving
        }
      }
    },
    { passive: false }
  );

  container.addEventListener(
    "touchend",
    (e) => {
      e.preventDefault();
      if (moving) {
        endInteraction(); // Call endInteraction only if there was movement
        moving = false; // Reset moving state
        clearTimeout(singleTapTimeout); // Clear the single tap timeout if moving was performed
      }
    },
    { passive: false }
  );

  }
  function setupInteractionListeners() {
    // Mouse events
    container.addEventListener("mousedown", (e) => {
      e.preventDefault(); // Prevent default behavior (text selection, etc.)
      startInteraction(e,e.clientX, e.clientY);
    });

    document.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
    document.addEventListener("mouseup", endInteraction);

    container.addEventListener("wheel", (e) => {
      if (interactingStates.get(containerId)) {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const zoom = e.deltaY > 0 ? -zoomIntensity : zoomIntensity;
        scale = Math.min(Math.max(0.125, scale + zoom), 4);
        updateTransform();
      }
    });

    container.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  function setupControlButtons() {
    parentElement
      .querySelector(`#zoom-in`)
      .addEventListener("click", () => applyZoom(0.1));
    parentElement
      .querySelector(`#zoom-out`)
      .addEventListener("click", () => applyZoom(-0.1));
    parentElement.querySelector(`#reset`).addEventListener("click", (e) => {
      if (e.isAllFloor){
        eventBus.emit("changeGraphs", {
          containerId: 5,
        });
      }else{
        eventBus.emit("changeGraphs", {
           containerId: 1,
        });
      } 
      eventBus.emit("disableButtons");

      isResetMode = true;
      isMouseDownEventActive = false;

      let container_;
      viewportWidth = window.innerWidth;
      for (var i = 1; i <= 4; i++) {
        container_ = document.getElementById(`visualization-container${i}`);
        container_.style.visibility = "visible";

        const config = configurations[i] || configurations[1]; // Fallback to config 1 if undefined
        const { zIndex, offsetY, widthSettings } = config;

        const setting = widthSettings.find((s) => viewportWidth >= s.minWidth);
        const { offsetZ, offsetX, scale } = setting;

        // scale = 1;
        rotateX = 60;
        rotateY = 0;
        rotateZ = -45;
        interactingStates.set(containerId, false);
        container_.style.transform = `perspective(2000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translate3d(${offsetX}px, ${offsetY}px, ${offsetZ}px) scale(${scale})`;
        container_.style.zIndex = zIndex;
        d3.select(`#floorTooltip1`).style("visibility", "visible");
        d3.select(`#floorTooltip2`).style("visibility", "visible");
        d3.select(`#floorTooltip3`).style("visibility", "visible");
        d3.select(`#floorTooltip4`).style("visibility", "visible");

        let position;
        if (viewportWidth >= 992) {
          position = tooltipPositions.large;
        } else if (viewportWidth >= 768) {
          position = tooltipPositions.medium;
        } else {
          position = tooltipPositions.small;
        }

        position.top.forEach((top, index) => {
          const tooltipId = `#floorTooltip${index + 1}`;
          d3.select(tooltipId)
            .style("top", `${top}px`)
            .style("left", `${position.left}px`)
            .style("transform", `translateY(0px)`);
        });

        selectedContainer = "visualization-container1";
        if (activity_tooltip == true) {
          hideTooltipsExcept(selectedContainer);
          delayedUpdateTooltips(250, containerId);
        }
      }
      // updateTransform();
      const rotateButton = parentElement.querySelector(`#rotate`);
      const translateButton = parentElement.querySelector(`#translate`);
      rotateButton.classList.remove("button-active");
      translateButton.classList.remove("button-active");
    });

    const rotateButton = parentElement.querySelector(`#rotate`);
    const translateButton = parentElement.querySelector(`#translate`);

    function toggleButtonActive(activeButton) {
      rotateButton.classList.remove("button-active");
      translateButton.classList.remove("button-active");
      activeButton.classList.add("button-active");
    }
    rotateButton.addEventListener("click", () => {
      currentMode = "rotate";
      toggleButtonActive(rotateButton);
    });
    translateButton.addEventListener("click", () => {
      currentMode = "translate";
      toggleButtonActive(translateButton);
    });
    //toggleButtonActive(rotateButton);
  }

  setupInteractionListeners();
  setupTouchListeners();
  setupHoverListeners();
  setupControlButtons();

}

export { addPanningAndZoomingToContainer, selectedContainer };
