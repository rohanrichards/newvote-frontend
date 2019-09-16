import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

@Component({
	selector: 'app-make-suggestion',
	templateUrl: './make-suggestion.component.html',
	styleUrls: ['./make-suggestion.component.scss']
})
export class MakeSuggestionComponent implements OnInit {


	suggestionForm: FormGroup;
	@Input() parent: string;
	@Output() submitForm: EventEmitter<any> = new EventEmitter();

	constructor(private formBuilder: FormBuilder) { }

	ngOnInit() {
		this.createForm();
	}

	createForm() {
		this.suggestionForm = new FormGroup({
			title: new FormControl('',[Validators.required]),
			type: new FormControl(this.parent, [Validators.required]),
			description: new FormControl('',[Validators.required])
		})
	} 

	sendForm() {
		this.submitForm.emit(this.suggestionForm.value);
		this.suggestionForm.reset();
		this.createForm();
	}
}
