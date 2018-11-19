import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';

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
	topicForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		description: new FormControl('', [Validators.required]),
		imageUrl: new FormControl('', [Validators.required])
	});

	constructor(
		private topicService: TopicService
	) { }

	ngOnInit() {
		this.topicForm.get('imageUrl').valueChanges.subscribe(val => this.onImageChange(val));
	}

	// get the Image File as a DataURL for previewing on the page
	onImageChange(image: any) {
		if (image.files && image.files[0]) {
			const reader = new FileReader();

			reader.onload = (pe: ProgressEvent) => {
				this.imageUrl = (<FileReader>pe.target).result;
			};

			reader.readAsDataURL(image.files[0]);
		}
	}

	onSave() {
		this.topic = <ITopic>this.topicForm.value;
		console.log(this.topic);

		// need to upload the image to cloudinary via a service first
		// grab the https URL provided and store that in imageUrl

		this.topicService.create({ entity: this.topic }).subscribe(t => {
			console.log(t);
		});
	}

}
