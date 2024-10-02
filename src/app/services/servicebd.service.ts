import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@awesome-cordova-plugins/sqlite/ngx';
import { BehaviorSubject, Observable } from 'rxjs';
import { Noticias } from './noticias';
import { AlertController, Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ServicebdService {
  //variable de conexion a la BD
  public database!: SQLiteObject;

  //variables de las tablas
  tablaNoticias: string = "CREATE TABLE IF NOT EXISTS noticia(idnoticia INTEGER PRIMARY KEY autoincrement, titulo VARCHAR(100) NOT NULL, texto TEXT NOT NULL);";
  //ctrear variables pára realizar insert por defecto
  registronoticia:string = "INSERT INTO or IGNORE noticia(idnoticia,titulo,texto) VALUES (1,'soy un titulo de la noticia','hola soy el texto de la noticia');";
  //creacion variables de observables para las consultas de base de datos
  listanoticias = new BehaviorSubject([]);
  //trabajar con una variable observable para el estado de la base de datos
  private isDBredy: BehaviorSubject<boolean> = new BehaviorSubject(false);



  constructor(private sqlite:SQLite, private platform: Platform, private alertController:AlertController) {
    this.crearBD();
   }

   crearBD(){
    //verificar si la plataforma esta lista
    this.platform.ready().then(()=>{
      //crear base de datos
      this.sqlite.create({
        name: 'bdnoticias.db',
        location: 'default'
      }).then((bd:SQLiteObject)=>{
        //guardar la conexion
        this.database = bd
        //llamar a la funcion de crear tablas
        this.crearTablas();

        //modificar el status de la base de datos 
        this.isDBredy.next(true);
        this.consultarNoticias();
      }).catch(e=>{
        this.presentAlert('crear BD','Error' + JSON.stringify(e));
      })
    })
   }

  fetchNoticias(): Observable<Noticias[]>{
    return this.listanoticias.asObservable();
  }

  dbState(){
    return this.isDBredy.asObservable();
  }

  update(){
    return this.isDBredy.asObservable();
  }

  async crearTablas(){
    try{
      this.database.executeSql(this.tablaNoticias,[]);


      this.database.executeSql(this.registronoticia, []);
    }catch(e){
      this.presentAlert('crear tablas','error: '+ JSON.stringify(e));
    }
  }

  async presentAlert(titulo:string, msj:string) {
    const alert = await this.alertController.create({
      header: titulo,
      message: msj,
      buttons: ['OK'],
    });

    await alert.present();
  }

  //funcion para traer todas las noticias registradas

  consultarNoticias(){
    //retornar la ejecucion de la sentencia sql
    return this.database.executeSql('SELECT * FROM noticia',[]).then(res=>{
      //crear variable que almacena el resultado del select ya que la variable res solo guarda la consulta temporalmente
      let items:Noticias[] = [];
      //verificar si existen registros traidos por el select 
      if(res.rows.length > 0 ){
        //recorro el resultado registro a registro
        for(var i = 0; i < res.rows.lenght; i++){
          //agregar registro a registro en mi arreglo items
          items.push({
            //la estructura de esto es variable (nombre de la clase): valor (nombre base e datos)
            idnoticia:res.items(i).idnoticia,
            titulo:res.items(i).titulo,
            texto:res.items(i).texto
          })
        }
        //actualizar el observable ya que tenemos los nuevos registros con el cual modificar su valor
        this.listanoticias.next(items as any);

      }

    })
  }

  //insertar un nuevo registro en la tabla noticias
  //necesito los datos a ingresar, no necesito el id ya que lo defini como autoincrementable
  insertarNoticias(tit:string, tex:string){
    //cuando las variables a ingresar son variables de programacion, remplazo los valores por signo de interrogacion
    return this.database.executeSql('INSERT INTO noticia(titulo,texto) VALUES (?,?)'
    ,[tit,tex]).then(res=>{
      this.presentAlert('insert','moticia creada de forma correcta');
    }).catch(e=>{
      this.presentAlert('insert noticia','error: '+JSON.stringify(e));
    })
  }

  modificarNoticia(id:number, tit:string, tex:string){
    //las variables que envio "corchetes azul" deben ser en el orden de los signos de interrogacion
    return this.database.executeSql('UPDATE noticia SET titulo = ?,texto=? where idnoticia = ?',[tit,tex,id]).then(res=>{
      this.presentAlert('update','noticia modificada de manera correcta');
    }).catch(e=>{
      this.presentAlert('update fallido','error: '+JSON.stringify(e));
    })
  }

  eliminarNoticia(id:number){
    return this.database.executeSql('DELETE FROM noticia WHERE idnoticia = ?',[id])
    .then(res=>{
      this.presentAlert('delete','noticia eliminada de manera correcta');
    }).catch(e=>{
      this.presentAlert('delete noticia','error: ' + JSON.stringify(e));
    })
  }




}
