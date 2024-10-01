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
      }).catch(e=>{
        this.presentAlert('crear BD','Error' + JSON.stringify(e));
      })
    })
   }

  fetchNoticias(): Observable<Noticias[]>{
    return this.listanoticias.asObservable();
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





}
