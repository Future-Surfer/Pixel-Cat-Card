window.pixelCatCardAttentionV1=function(event,{cardOwnerFor,clickDestination,attentionWinner,CAT_OWNERS}) {
    if(this.userHeld||this.config.click_attention===false||!this.root||event.button!==0||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey||this.blocked())return;
    const path=event.composedPath();if(!path.includes(this.root)||path.includes(this)||path.some(el=>el.dataset?.pixelCatOverlay!==undefined||el.dataset?.catPost!==undefined||el.localName==='pixel-cat-home'||el.matches?.('input,textarea,select,[contenteditable="true"]')))return;
    const card=path.find(el=>el.localName==='ha-card'||el.hasAttribute?.('data-cat-surface'));if(!card)return;const owner=cardOwnerFor(card),surfaces=this.surfaces.filter(s=>!s.home&&cardOwnerFor(s.el)===owner);
    const destination=clickDestination(surfaces,event.clientX,event.clientY,this.scale,s=>!!this.pathTo(s)&&!!this.pathTo(this.home,s));if(!destination)return;
    const peers=[...CAT_OWNERS].filter(([cat,info])=>info.root===this.root&&cat.isConnected&&!cat.blocked()&&cat.surfaces.some(s=>!s.home&&cardOwnerFor(s.el)===owner&&cat.pathTo(s)&&cat.pathTo(cat.home,s))).map(([cat])=>cat);if(peers.length&&attentionWinner(peers,event.clientX,event.clientY)!==this)return;
    this.setAttribute('data-attention-source','card-click');this.setAttribute('data-attention-target',destination.id);this.requestVisit(destination.id,'interested',destination.point);
  };
