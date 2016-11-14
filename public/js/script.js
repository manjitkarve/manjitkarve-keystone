var menuStylesheet=null;
var overlayCloseActions={
  preActions: [],
  postActions: [],
  addPreAction: function(action){
    if ("function" !== typeof action){
      throw Error("action should be a function");
    }
    this.preActions.push(action);
  },
  addPostAction: function(action){
    if ("function" !== typeof action){
      throw Error("action should be a function");
    }
    this.postActions.push(action);
  }
};
$(document).ready(function(){
  updateLevels();
  setScrollingInfo();
  replaceSVGimgs();
  if ($("nav.flared").length>0){
    reposition(calculateMenuPositions());
  }
  $(window).on('resize', function(){
    if ($("nav.flared").length>0){
      reposition(calculateMenuPositions());
    }
  });
  $(window).on("scroll", function(evt){
    setScrollingInfo($("#page-container header nav").get(0));
  });

  $("#home-page>a").on("click", function(evt){
    evt.preventDefault();
    var nav=$("#page-container header nav");
    if (nav.hasClass("flared")){
      nav.removeClass("flared");
      $("#page-container").removeClass("animationEnded");
      window.setTimeout(function(){
        $("#page-container").removeClass("navFlared");
      }, 50);
      if (document.body.scrollTop>50){
        nav.addClass("minimized standard");
      } else {
        nav.addClass("standard");
      }
    } else {
      nav.removeClass("standard", "minimized");
      nav.addClass("flared");
      $("#page-container").addClass("navFlared");
      window.setTimeout(function(){
        $("#page-container").addClass("animationEnded");
      }, 170);
      reposition(calculateMenuPositions());
    }
  });

  $("#resumeContent .summary").each(function(i, summaryTarget){
    $(summaryTarget).on("click", function(evt){
      var currentExpanded=$("#resumeContent .company.expanded").toggleClass("expanded collapsed").get(0);
      if (currentExpanded !== this.parentNode){
        $(this).parent().toggleClass("expanded collapsed");
      }
    });
  });

  $("#resumeContent .degree").on("click", function(){
    $(this).toggleClass("expanded collapsed");
  });

  $("#portfolioContent .artifactSet").on("mouseover", function(){
    $(this).addClass("over").removeClass("out");
  }).on("mouseout", function(){
    $(this).addClass("out").removeClass("over");
  }).find(".moreLink").on("click", showPortfolioPopup);

  $("#overlay a.close").on("click", closeOverlay);

  $("#overlayContent[page='portfolio-page'] a.nav").on('click', function(evt){
    var $artifactSet=$("#imageContainer").find(".artifactSet");
    var delta = parseInt($(this).attr("delta"));
    var currentlyActive = parseInt($artifactSet.attr("currentlyActive"));
    currentlyActive+=delta;
    currentlyActive=currentlyActive<1?$artifactSet.find(".artifact").length:currentlyActive;
    currentlyActive=currentlyActive>$artifactSet.find(".artifact").length?1:currentlyActive;
    var artifactSelector="#overlayContent[page='portfolio-page'] .artifactSet article:nth-child("+currentlyActive+")";
    var height=$(artifactSelector+" img").height();
    jss.set(artifactSelector, {
      height: height+"px",
      top: (($artifactSet.height()-height)/2)+"px"
    });
    $artifactSet.attr("currentlyActive", ""+currentlyActive);
  });
});

function setScrollingInfo(nav){
  if (nav===null || typeof nav === "undefined"){
    nav=$("#page-container header nav").get(0);
  }
  $nav=$(nav);
  var currentStatus=$nav.attr("currentScrollStatus");

  var $main=$("#page-container main"), main=$main.get(0);

  if (typeof currentStatus === "undefined" || currentStatus === null || currentStatus.length === 0){
    if ($(nav).hasClass("flared")){
      currentStatus="flared";
    } else {
      currentStatus="standard";
    }
  }

  if (currentStatus === "flared"){
    $main.attr("currentScrollStatus", currentStatus);
    $nav.attr("currentScrollStatus", currentStatus);
    return;
  }

  var newStatus = "";
  var scrollTop=Math.max(document.body.scrollTop, $("html").get(0).scrollTop);
  if (scrollTop>50){
    newStatus = "minimized";
  } else if (scrollTop===0){
    newStatus = "standard";
  } else {
    newStatus = "minimizing";
  }

  if (newStatus==="minimized"){
    $nav.addClass("minimized").removeClass("minimizing").removeAttr("scrolling");
  } else if (newStatus==="standard"){
    $nav.removeClass("minimized minimizing").removeAttr("scrolling");
  } else if (newStatus==="minimizing"){
    $nav.removeClass("minimized").addClass("minimizing").attr("scrolling", ""+document.body.scrollTop);
  }
  $main.attr("currentScrollStatus", newStatus);
  $nav.attr("currentScrollStatus", newStatus);
}

function reposition(coords){
  jss.remove();

  jss.set(".flared #home-page>a", {
    "top": coords.logo.t+"px",
    "left": coords.logo.l+"px",
    "width": coords.logo.w+"px",
    "height": coords.logo.h+"px"
  });
  for (var group in coords.groups) {
    for (var link in coords.groups[group]){
      jss.set(".flared #"+link, {
        "top": coords.groups[group][link].space.t+"px",
        "left": coords.groups[group][link].space.l+"px",
        "width": coords.groups[group][link].space.w+"px",
        "height": coords.groups[group][link].space.h+"px"
      });
      if (coords.groups[group][link].title){
        jss.set(".flared #"+link+">a .text", {
          "top": coords.groups[group][link].title.t+"px",
          "left": coords.groups[group][link].title.l+"px"
        });
      }
      if (coords.groups[group][link].submenu){
        jss.set(".flared #"+link+">a+.submenu", {
          "top": coords.groups[group][link].submenu.t+"px",
          "left": coords.groups[group][link].submenu.l+"px"
        });
      }
    }
  }
}

function calculateMenuPositions(){
  var coords={
    logo: {},
    groups: {}
  };
  var height=document.querySelector("body").offsetHeight;var lh=height;
  var width=document.querySelector("body").offsetWidth;var lw=width;
  var navOffset={
    t:document.querySelector("nav").offsetParent.offsetTop,
    l:document.querySelector("nav").offsetParent.offsetLeft
  }
  if (width<height){
    lh=lw=width/3.5;
  } else {
    lw=lh=height/3.5;
  }
  var ll=(width-lw)/2-navOffset.l;
  var lt=(height-lh)/2-navOffset.t;

  coords.logo=cartesianSpace(ll, lt, lw, lh);

  var $groups=$("nav .navigation-menu.group");
  var mainStartAngle=Math.PI/12;
  var delta=2*Math.PI/$groups.length;
  var distanceIncrement=1.1;
  var l1Radius=lw*distanceIncrement;
  var l2Radius=l1Radius*distanceIncrement;
  var center={t: height/2-navOffset.t, l: width/2-navOffset.l};
  var reductionFactor=0.6;
  var step=reductionFactor*1.05;
  $groups.each(function(i, group){
    //groups.forEach(function(group, i, groups)
    var $group=$(group);
    coords.groups[$group.attr("Id")]={};
    mainStartAngle=mainStartAngle+delta*i;
    var $links=$group.find(".nav-link-list-item.l1");
    var linkStartAngle=mainStartAngle+step*($links.length-1)/2;
    $links.each(function(j, link){
    //links.forEach(function(link, j, links)
    var $link=$(link);
      var linkAngle=linkStartAngle-step*j;
      var space=cartesianSpace(0,0,0,0);
      var linkCenter={
        l: center.l+l1Radius*Math.cos(linkAngle),
        t: center.t-l1Radius*Math.sin(linkAngle)
      }
      space.w=lw*reductionFactor;
      space.h=lh*reductionFactor;
      space.l=linkCenter.l-space.w/2;
      space.t=linkCenter.t-space.h/2;
      coords.groups[$group.attr("Id")][$link.attr("Id")]={
        "space":space
      };
      l2Radius=space.w/2*distanceIncrement;
      var title=$($link.children(".nav-link").get(0)).find(".text").get(0);
      var titleSpace=null;
      if (title){
        var quadrant=getQuadrant(linkAngle);
        titleSpace=cartesianSpace();
        titleSpace.l = l2Radius*Math.cos(linkAngle);
        titleSpace.t = -l2Radius*Math.sin(linkAngle);
        titleSpace.w=title.offsetWidth;
        titleSpace.h=title.offsetHeight;
        switch (quadrant) {
          case 1:
            titleSpace.t+=-title.offsetHeight+space.h/2;
            titleSpace.l+=space.w/2
            break;
          case 2:
            titleSpace.t+=space.h/2-title.offsetHeight;
            titleSpace.l+=space.w/2-title.offsetWidth;
            break;
          case 3:
            titleSpace.l+=space.w/2-title.offsetWidth;
            titleSpace.t+=space.h/2;
            break;
          case 4:
            titleSpace.l+=space.w/2;
            titleSpace.t+=space.h/2;
        }
        coords.groups[$group.attr("Id")][$link.attr("Id")].title=titleSpace;
      }
      var $submenu = $link.children(".submenu");
      if ($submenu.length > 0){$submenu=$($submenu.get(0));} else {$submenu=null;}
      var submenuSpace=null;
      if ($submenu) {
        submenuSpace=cartesianSpace(0,0,0,0);
        submenuSpace.l=titleSpace.l;
        submenuSpace.t=titleSpace.t+titleSpace.h;
        coords.groups[$group.attr("Id")][$link.attr("Id")].submenu=submenuSpace;
      }

    });

  });

  return coords;

}

function cartesianSpace(left, top, width, height){
  return {
    l: left,
    t: top,
    w: width,
    h: height
  };
}

//return 1st quadrant to 4th quadrant as 1 to 4
function getQuadrant(angle){
  while(angle<0){
    angle+=Math.PI*2;
  }
  return Math.floor(angle/(Math.PI/2))+1;
}

function updateLevels(ul, level){
  var prefix="l";
  if (level === null || typeof level === "undefined"){
    level=0;
  }
  if (ul==null || typeof ul === "undefined"){
    ul=$('nav ul.navigation-menu').get(0);
  }
  if (ul!==null && typeof ul !== "undefined"){
    var $ul=$(ul);
    $ul.addClass(prefix+level).children("li.nav-link-list-item").each(function(i, li){
      $(li).addClass(prefix+level);
      $(li).children("ul").each(function(j, ul){
        updateLevels(ul, level+1);
      });
    });
  }
}

function replaceSVGimgs(){
  $(".replaceWithSVGContent").each(function(i, img){
    $.get(img.src, function(data){
      if (typeof data !== "undefined") {
        if (typeof data.childNodes !== "undefined" && data.childNodes.length>0) {
          img.parentNode.replaceChild(data.childNodes[0], img);
        }
      }
    });
  });
}

function openOverlay(){
  $("#overlay").addClass("active");
}

function closeOverlay(){
  while(overlayCloseActions.preActions.length>0){
    overlayCloseActions.preActions.shift().call();
  }
  $("#overlay").removeClass("active");
  while(overlayCloseActions.postActions.length>0){
    overlayCloseActions.postActions.shift().call();
  }
}

function showPortfolioPopup(evt, artifactSet){
  var link=evt.target;
  var artifactSet=$(link).closest(".artifactSet").get(0);
  $(artifactSet).removeClass("inPage").addClass("floated");
  $(artifactSet).after("<div id='placeholder'/>");
  $(artifactSet).appendTo("#imageContainer");
  // $("#page-container").addClass("popupActive");
  $("#body, footer").addClass("popupActive");
  $(artifactSet).attr("currentlyActive", "1");
  jss.remove();
  openOverlay();
  var artifactSelector="#overlayContent[page='portfolio-page'] .artifactSet article:nth-child(1)";
  var height=$(artifactSelector+" img").height();
  jss.set(artifactSelector, {
    height: height+"px",
    top: (($(artifactSet).height()-height)/2)+"px"
  });
  overlayCloseActions.addPostAction(function(){
    $(artifactSet).appendTo("#placeholder");
    $(artifactSet).unwrap();
    $(artifactSet).addClass("inPage").removeClass("floated");
    jss.remove();
    // $("#page-container").removeClass("popupActive");
    $("#body, footer").removeClass("popupActive");
  });
}
