import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterTestingModule } from '@angular/router/testing';
import { Angulartics2Module } from 'angulartics2';

import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { MaterialModule } from '@app/material.module';
import { IssueEditComponent } from './issue-edit.component';
import { IssueService } from '@app/core/http/issue/issue.service';

describe('IssueComponent', () => {
	let component: IssueEditComponent;
	let fixture: ComponentFixture<IssueEditComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				BrowserAnimationsModule,
				FlexLayoutModule,
				MaterialModule,
				RouterTestingModule,
				Angulartics2Module.forRoot([]),
				CoreModule,
				SharedModule,
				HttpClientTestingModule
			],
			declarations: [IssueEditComponent],
			providers: [IssueService]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(IssueEditComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
