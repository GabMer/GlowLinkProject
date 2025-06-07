import { Pipe, PipeTransform } from '@angular/core'

@Pipe({
<<<<<<< Updated upstream
  name: 'filterBy',  // Nombre del pipe
  standalone: true,  // Esto es si lo estás utilizando como pipe standalone
=======
  name: 'filterBy',
  standalone: true
>>>>>>> Stashed changes
})
export class FilterByPipe implements PipeTransform {
  transform(items: any[], properties: string[], value: any): any[] {
    if (!items || !properties || properties.length === 0) {
      return items
    }

    return items.filter(item => {
      return properties.some(property => {
        const propertyValue = this.getNestedProperty(item, property)
        return propertyValue === value
      })
    })
  }

  private getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj)
  }
}