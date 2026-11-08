// Local compatibility-fixture control: freeze a brief inspection for visual review.
const home=document.querySelector('pixel-cat-home'),header=document.querySelector('header');
const label=document.createElement('label'),input=document.createElement('input');input.type='checkbox';label.style.cssText='margin-left:auto;white-space:nowrap';label.append(input,document.createTextNode(' Pause at inspection'));header.append(label);
new MutationObserver(()=>{if(input.checked&&!home.paused&&!home.motion&&home.idle?.inspectionId&&home.getAttribute('data-frame')?.startsWith('idle-look')){input.checked=false;home.shadowRoot.querySelector('[data-action="pause"]').click();}}).observe(home,{attributes:true,attributeFilter:['data-frame']});
