import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterBy',  // Nombre del pipe
  standalone: true,  // pipe standalone
})
export class FilterByPipe implements PipeTransform {
  transform(items: any[], property: string[], value: any): any[] {
    if (!items) return [];
    if (!property || !value) return items;

    return items.filter((item) => {
      let match = true;
      property.forEach((prop) => {
        if (item[prop] !== value) {
          match = false;
        }
      });
      return match;
    });
  }
}
