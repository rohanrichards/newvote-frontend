import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

import { TopicService } from '../topic.service';

export class MyErrorStateMatcher implements ErrorStateMatcher {
	isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
		const isSubmitted = form && form.submitted;
		return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
	}
}

@Component({
	selector: 'app-topic',
	templateUrl: './topic-create.component.html',
	styleUrls: ['./topic-create.component.scss']
})
export class TopicCreateComponent implements OnInit {

	topic: any;
	isLoading: boolean;
	topicForm = new FormGroup({
		name: new FormControl('', [Validators.required]),
		description: new FormControl('', [Validators.required])
		// image: new FormControl('', [Validators.required])
	});
	matcher = new MyErrorStateMatcher();

	constructor(
		private topicService: TopicService
	) { }

	ngOnInit() { }

	save() {

	}

}
