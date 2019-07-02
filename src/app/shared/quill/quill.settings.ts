const formats = [
	'background',
	'bold',
	'color',
	'font',
	'code',
	'italic',
	'link',
	'size',
	'strike',
	'script',
	'underline',
	'blockquote',
	'header',
	'indent',
	'list',
	'align',
	'direction',
	'code-block',
	'formula'
	// 'image'
	// 'video'
];


export const QuillSettings = {
	modules: {
		toolbar: [
			['bold', 'italic', 'underline', 'strike'],
			['blockquote', 'code-block'],
			[{ 'header': 1 }, { 'header': 2 }],
			[{ 'list': 'ordered' }, { 'list': 'bullet' }],
			[{ 'script': 'sub' }, { 'script': 'super' }],
			[{ 'indent': '-1' }, { 'indent': '+1' }],
			[{ 'direction': 'rtl' }],
			[{ 'size': ['small', false, 'large', 'huge'] }],
			[{ 'header': [1, 2, 3, 4, 5, 6, false] }],
			[{ 'color': [] }, { 'background': [] }],
			[{ 'font': [] }],
			[{ 'align': [] }],
			['clean'],
		]
	},
	format: formats,
} as any;
