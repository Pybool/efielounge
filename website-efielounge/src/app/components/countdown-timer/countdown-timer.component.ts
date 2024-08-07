import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';

const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 10;
const ALERT_THRESHOLD = 5;

const COLOR_CODES = {
  info: { color: 'green' },
  warning: { color: 'orange', threshold: WARNING_THRESHOLD },
  alert: { color: 'red', threshold: ALERT_THRESHOLD },
};

const TIME_LIMIT = 20;
@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './countdown-timer.component.html',
  styleUrl: './countdown-timer.component.scss',
})
export class CountdownTimerComponent implements OnInit, OnDestroy {
  TIME_LIMIT = 20;
  @Input() order: any = '';
  @Input() timeLeft: any;
  timePassed = 0;
  timerInterval: any;
  formattedTime: any;
  remainingPathColor = COLOR_CODES.info.color;

  ngOnInit() {
    let str = JSON.parse(
      window.localStorage.getItem('tmr') as any
    );
    console.log(str)
    if (str) {
      this.TIME_LIMIT = str[this.order._id].tmr;
    } else {
      this.TIME_LIMIT = this.getTimeLeft(
        this.order.readyInSetAt,
        this.order.readyIn
      );

      console.log(
        'Mothrfucker ',
        this.TIME_LIMIT,
        this.order.readyInSetAt,
        this.order.readyIn
      );
      this.startTimer();
    }
  }

  ngOnDestroy() {
    const str: any = {};
    str[this.order._id] = this.TIME_LIMIT.toString();
    window.localStorage.setItem('tmr', JSON.stringify(str));
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  getTimeLeft(startTime: string, originalTimeSet: number) {
    const startDate = new Date(startTime);

    const readyDate: any = new Date(
      startDate.getTime() + originalTimeSet * 60000
    );
    const currentDate: any = new Date();
    const timeDiff: any = readyDate - currentDate;
    const remainingMinutes: number = Math.max(Math.floor(timeDiff / 60000), 0);

    return remainingMinutes * 60;
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.timePassed += 1;
      this.timeLeft = this.TIME_LIMIT - this.timePassed;
      this.formattedTime = this.formatTime(this.TIME_LIMIT - this.timePassed);
      this.updateDisplay();

      if (this.timeLeft <= 0) {
        this.onTimesUp();
      }
    }, 1000);
  }

  onTimesUp() {
    clearInterval(this.timerInterval);
  }

  updateDisplay() {
    this.setCircleDasharray();
    this.setRemainingPathColor(this.timeLeft);
  }

  formatTime(time: number): string {
    const minutes = Math.floor(time / 60);
    let seconds: any = time % 60;

    if (seconds < 10) {
      seconds = `0${seconds}`;
    }

    return `${minutes}:${seconds}`;
  }

  setRemainingPathColor(timeLeft: number) {
    const { alert, warning, info } = COLOR_CODES;
    const pathElement = document.getElementById('base-timer-path-remaining')!;

    if (timeLeft <= alert.threshold) {
      pathElement.classList.remove(warning.color);
      pathElement.classList.add(alert.color);
    } else if (timeLeft <= warning.threshold) {
      pathElement.classList.remove(info.color);
      pathElement.classList.add(warning.color);
    }
  }

  calculateTimeFraction(): number {
    const rawTimeFraction = this.timeLeft / this.TIME_LIMIT;
    return rawTimeFraction - (1 / this.TIME_LIMIT) * (1 - rawTimeFraction);
  }

  setCircleDasharray() {
    const circleDasharray = `${(
      this.calculateTimeFraction() * FULL_DASH_ARRAY
    ).toFixed(0)} ${FULL_DASH_ARRAY}`;
    const pathElement = document.getElementById('base-timer-path-remaining')!;
    pathElement.setAttribute('stroke-dasharray', circleDasharray);
  }
}
