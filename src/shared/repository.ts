// repository.ts por lo general hace referencia a la base de datos
// nosotros vamos a utlizar una ORM que se encarga de manejar la base de datos, por lo que el repositorio se encarga de manejar las operaciones de la base de datos a través del ORM, y el servicio se encarga de manejar la lógica de negocio, es decir, las operaciones que se realizan con los datos antes de guardarlos en la base de datos o después de obtenerlos de la base de datos, como por ejemplo, validar los datos, transformarlos, etc.

//por ahora trabajamos en memoria sin promesas
export interface Repository<T> {
  findAll(): T[] | undefined
  findONE(item: { id: string }): T | undefined
  add(item: T): T | undefined
  update(item: T): T | undefined
  delete(item: { id: string }): T | undefined


}