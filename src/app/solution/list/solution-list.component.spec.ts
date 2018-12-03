import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterTestingModule } from '@angular/router/testing';
import { Angulartics2Module } from 'angulartics2';

import { CoreModule } from '@app/core';
import { SharedModule } from '@app/shared';
import { MaterialModule } from '@app/material.module';
import { SolutionListComponent } from './solution-list.component';
import { SolutionService } from '@app/core/http/solution/solution.service';

describe('SolutionComponent', () => {
	let component: SolutionListComponent;
	let fixture: ComponentFixture<SolutionListComponent>;

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
			declarations: [SolutionListComponent],
			providers: [SolutionService]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SolutionListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
