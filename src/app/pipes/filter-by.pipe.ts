import { Pipe, type PipeTransform } from "@angular/core"

@Pipe({
  name: "filterBy",
  standalone: true,
})
export class FilterByPipe implements PipeTransform {
  transform(items: any[], field: string, value: any): any[] {
    if (!items || !field || value === undefined) {
      return items
    }

    return items.filter((item) => item[field] === value)
  }
}