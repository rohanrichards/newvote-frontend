import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';

import { ITopic } from '@app/core/models/topic.model';
import { TopicService } from '@app/core/http/topic/topic.service';

@Component({
	selector: 'app-topic',
	templateUrl: './topic-create.component.html',
	styleUrls: ['./topic-create.component.scss']
})
export class TopicCreateComponent implements OnInit {

	topic: ITopic;
	isLoading: boolean;
	imageUrl: any;
	uploader: FileUploader;
	topicForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		description: new FormControl('', [Validators.required]),
		imageUrl: new FormControl('', [Validators.required])
	});

	constructor(
		private topicService: TopicService
	) { }

	ngOnInit() {
		const uploaderOptions: FileUploaderOptions = {
			url: `https://api.cloudinary.com/v1_1/newvote/upload`,
			// Upload files automatically upon addition to upload queue
			autoUpload: false,
			// Use xhrTransport in favor of iframeTransport
			isHTML5: true,
			// Calculate progress independently for each uploaded file
			removeAfterUpload: true,
			// XHR request headers
			headers: [
				{
					name: 'X-Requested-With',
					value: 'XMLHttpRequest'
				}
			]
		};

		this.uploader = new FileUploader(uploaderOptions);

		this.uploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
			// Add Cloudinary's unsigned upload preset to the upload form
			form.append('upload_preset', 'qhf7z3qa');
			// Add file to upload
			form.append('file', fileItem);

			// Use default "withCredentials" value for CORS requests
			fileItem.withCredentials = false;
			return { fileItem, form };
		};
	}

	onFileChange(event: any) {
		if (event.target.files && event.target.files.length) {
			const [file] = event.target.files;
			const reader = new FileReader();

			reader.onload = (pe: ProgressEvent) => {
				this.imageUrl = (<FileReader>pe.target).result;
			};

			reader.readAsDataURL(file);
		}
	}

	onSave() {
		this.topic = <ITopic>this.topicForm.value;
		console.log(this.topic);

		this.uploader.onCompleteAll = () => {
			console.log('completed all');
		};

		this.uploader.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) => {
			if (status === 200 && item.isSuccess) {
				const res = JSON.parse(response);
				this.topic.imageUrl = res.secure_url;

				this.topicService.create({ entity: this.topic }).subscribe(t => {
					console.log(t);
				});
			}
		};

		this.uploader.uploadAll();
	}

}
