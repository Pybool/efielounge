import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateText',
  standalone: true,
})
export class TruncateTextPipe implements PipeTransform {

  transform(value: string, maxLength = 20): string {
    if (!value || value.length <= maxLength) {
      return value;
    }

    return value.slice(0, maxLength - 3) + '...';
  }
}
