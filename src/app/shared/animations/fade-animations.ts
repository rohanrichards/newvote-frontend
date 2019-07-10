import {
	state,
	style,
	animate,
	transition,
	query,
	stagger,
	keyframes
} from '@angular/animations';

https://blog.angularindepth.com/https-medium-com-thomasburleson-animated-ghosts-bfc045a51fba

export function fadeIn(selector: string, duration = '200ms ease-out') {
	return [
	  transition('* => *', [      
		query(selector, [
		  style({ opacity: 0.2, transform: 'translateY(-3px)'}), 
		  stagger('20ms', [
			animate(duration, style({
			  opacity: 1,
			  transform: 'translateY(0px)'
			}))
		  ])
		], {optional: true })
	  ])
	];
  }
  
  export function fadeOut(selector = ':leave', duration = 300) {
	return [
	  transition('* => *', [
		query(selector, [
		  style({ opacity: 1 }),
		  stagger('50ms', [
			animate('200ms', style({ 
			  opacity: 0,
			  display: 'none'
			}))
		  ])
		], {optional: true })
	  ])
	];
  }
  