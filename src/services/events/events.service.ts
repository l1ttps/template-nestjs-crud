import { Injectable } from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
@Injectable()
export class EventsService {
    private eventSub: Subject<EventData> = new Subject<EventData>();
  private eventObservable: Observable<EventData> = this.eventSub.asObservable();

  constructor() {
  }

  publish(event: EventData) {
    this.eventSub.next(event);
  }

  event(): Observable<EventData> {
    // return this.eventObservable;
    return this.eventSub.asObservable()
  }
}

export class EventData {
  key: string;
  value?: any;

  constructor(key: string) {
    this.key = key;
  }
}
