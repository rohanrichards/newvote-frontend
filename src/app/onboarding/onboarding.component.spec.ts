import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OnboardingComponent } from './onboarding.component';
import { createComponentFactory, Spectator } from '@ngneat/spectator';
import {MatStepperModule} from '@angular/material/stepper';

describe('OnboardingComponent', () => {

    let spectator: Spectator<OnboardingComponent>;
    const createComponent = createComponentFactory({
        component: OnboardingComponent,
        imports: [
            MatStepperModule
        ]
    })
    
    beforeEach(() => spectator = createComponent());

    it('should create the component', () => {
        const app = spectator.component;
        expect(app).toBeTruthy();
    })

    it('should have a logo of logo-gif.gif', () => {
        const component = createComponent()
        expect(component.query('img')).toBeTruthy()
        expect(component.query('img')).toHaveAttribute('src', 'assets/logo-gif.gif');
    })

    it('should have a link to a pdf', () => {
        const component = createComponent()
        expect(component.query('a')).toBeTruthy()
    })

    it('should have a title', () => {
        const component = createComponent()
        expect(component.query('h4')).toBeTruthy()
        expect(component.query('h4')).toHaveExactText('Create an online space for your community to make decisions.');
    })

    it('should have a four buttons', () => {
        const component = createComponent()
        const buttons = component.queryAll('button');
        expect(buttons).toHaveLength(4)
    })

    it('should have a horizontal stepper', () => {
        const component = createComponent()
        expect(component.query('mat-horizontal-stepper')).toBeTruthy()
        // expect(component.queryAll('mat-step')).toHaveLength(3)
    })
});
