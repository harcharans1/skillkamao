import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Roadmaps } from './roadmaps';

describe('Roadmaps', () => {
  let component: Roadmaps;
  let fixture: ComponentFixture<Roadmaps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Roadmaps],
    }).compileComponents();

    fixture = TestBed.createComponent(Roadmaps);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
