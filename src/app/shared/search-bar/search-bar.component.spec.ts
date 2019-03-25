import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MaterialModule } from '@app/material.module';
import { SearchBarComponent } from './searchBar.component';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        imports: [
          BrowserAnimationsModule,
          FlexLayoutModule,
          MaterialModule
        ],
        declarations: [SearchBarComponent]
      })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should not be visible by default', () => {
    // Arrange
    const element = fixture.nativeElement;
    const div = element.querySelectorAll('div')[0];

    // Assert
    expect(div.getAttribute('hidden')).not.toBeNull();
  });

  it('should be visible when app is loading', () => {
    // Arrange
    const element = fixture.nativeElement;
    const div = element.querySelectorAll('div')[0];

    // Act
    fixture.componentInstance.isLoading = true;
    fixture.detectChanges();

    // Assert
    expect(div.getAttribute('hidden')).toBeNull();
  });

  it('should not display a message by default', () => {
    // Arrange
    const element = fixture.nativeElement;
    const span = element.querySelectorAll('span')[0];

    // Assert
    expect(span.innerText).toBe('');
  });

  it('should display specified message', () => {
    // Arrange
    const element = fixture.nativeElement;
    const span = element.querySelectorAll('span')[0];

    // Act
    fixture.componentInstance.message = 'testing';
    fixture.detectChanges();

    // Assert
    expect(span.innerText).toBe('testing');
  });
});
