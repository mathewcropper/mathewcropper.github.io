$(function() {
	$('#vegas').vegas({
		delay: 7000,
		timer: false,
		shuffle: false,
		transition: 'fade',
		transitionDuration: 2000,
		cover: true,
		overlay: '/js/vegas/overlays/07.png',
		slides: [
		{ src: '/images/bg_image8.JPG', align: 'center', valign: '35%' },
		{ src: '/images/bg_image7.JPG', align: 'center', valign: '35%' },
		{ src: '/images/bg_image5.JPG', align: 'center', valign: '35%'  },
		{ src: '/images/bg_image6.JPG', align: 'center', valign: 'center' }
		]
	});
});