<template>
  <div class="Home">
    <v-dialog v-model="dialogoEditar" persistent max-width="500px">
      <v-card>
        <v-card-title>
          <span class="text-h5">Editar Tarea</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-text-field
              v-model="nuevoTituloEditado"
              label="Título de la tarea"
              @keyup.enter="guardarEdicion()"
              autofocus
            ></v-text-field>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="cancelarEdicion()">
            Cancelar
          </v-btn>
          <v-btn color="primary" @click="guardarEdicion()">
            Guardar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-text-field
      v-model="nuevoTituloTarea"
      @click:append="agregarTarea()"
      @keyup.enter="agregarTarea()"
      class="pa-3"
      outlined
      label="Nueva tarea"
      append-icon="mdi-plus"
      hide-details
      clearable
    >
    </v-text-field>

    <v-list flat>
      <div v-for="tarea in tareas" :key="tarea.id">
        <v-list-item
          @click="TareaHecho(tarea.id)"
          :class="{ 'blue': tarea.hecho }"
        >
          <template v-slot>
            <v-list-item-action>
              <v-checkbox
                :input-value="tarea.hecho" color="primary"
              ></v-checkbox>
            </v-list-item-action>

            <v-list-item-content>
              <v-list-item-title
                :class="{ 'text-decoration-line-through': tarea.hecho }"
              >{{ tarea.titulo }}</v-list-item-title>
            </v-list-item-content>

            <v-list-item-action>
              
              <v-btn
                icon
                @click.stop="iniciarEdicion(tarea)"
              >
                <v-icon color="primary lighten-1">mdi-pencil</v-icon>
              </v-btn>
              <v-btn
                icon
                @click.stop="BorrarTarea(tarea.id)"
              >
                <v-icon color="red lighten-1">mdi-delete</v-icon>
              </v-btn>
            </v-list-item-action>
          </template>
        </v-list-item>
      </div>
    </v-list>
  </div>
</template>

<script>
// 1. Importamos la 'db' de tu archivo firebase.js
import { db } from '@/plugins/firebase';

// 2. Importamos TODAS las funciones de Firestore v9 que necesitamos
import { 
  collection,   // Para referenciar la colección 'tareas'
  query,        // Para crear una consulta
  orderBy,      // Para ordenar los resultados
  onSnapshot,   // Para LEER en tiempo real (Read)
  addDoc,       // Para AÑADIR un documento (Create)
  updateDoc,    // Para ACTUALIZAR un documento (Update)
  deleteDoc,    // Para BORRAR un documento (Delete)
  doc,          // Para referenciar un documento por su ID
  serverTimestamp // Para guardar la fecha/hora del servidor
} from "firebase/firestore";

export default {
  name: 'Home',
  data() {
    return {
      nuevoTituloTarea: "",
      
      // 'tareas' empieza vacío. Firestore lo llenará.
      tareas: [], 

      // Variables para el diálogo de edición (sin cambios)
      dialogoEditar: false, 
      tareaAEditar: null, 
      nuevoTituloEditado: "" 
    }
  },
  
  /**
   * 'mounted' es un hook de Vue que se ejecuta cuando
   * el componente se carga. Es el lugar perfecto para
   * pedirle a Firebase que nos traiga los datos.
   */
  mounted() {
    this.obtenerTareas();
  },

  methods: {
    /**
     * LEER (Read)
     * Se conecta a Firestore y escucha cambios en tiempo real.
     */
    obtenerTareas() {
      try {
        // Creamos una consulta (query) a la colección 'tareas'
        // y la ordenamos por 'creadoEn' de forma descendente.
        const q = query(collection(db, 'tareas'), orderBy('creadoEn', 'desc'));

        // onSnapshot es el "oyente". Se activa una vez al inicio
        // y luego CADA VEZ que algo cambia en la base de datos.
        onSnapshot(q, (querySnapshot) => {
          
          // Creamos un array temporal para guardar las tareas
          const tareasTemp = [];
          
          querySnapshot.forEach((doc) => {
            // Empujamos cada tarea al array temporal
            tareasTemp.push({
              id: doc.id, // El ID único del documento
              titulo: doc.data().titulo,
              hecho: doc.data().hecho
              // (No necesitamos 'creadoEn' aquí, solo para ordenar)
            });
          });
          
          // Reemplazamos el array local 'tareas' con los datos de Firebase.
          // Vue/Vuetify reaccionará y pintará la lista.
          this.tareas = tareasTemp;
        });

      } catch (error) {
        console.error("Error al obtener tareas: ", error);
      }
    },

    /**
     * CREAR (Create)
     * Añade una nueva tarea a la colección 'tareas' en Firestore.
     */
    async agregarTarea() {
      if (this.nuevoTituloTarea.trim() === "") return;

      try {
        // Objeto de la nueva tarea
        const nTarea = {
          titulo: this.nuevoTituloTarea,
          hecho: false,
          creadoEn: serverTimestamp() // Fecha de creación
        }
        
        // Usamos 'addDoc' para añadir el documento
        await addDoc(collection(db, 'tareas'), nTarea);
        
        // Limpiamos el campo de texto
        this.nuevoTituloTarea = "";
        
        // NOTA: No hacemos 'this.tareas.push()'.
        // ¡'onSnapshot' detectará este cambio y lo hará por nosotros!

      } catch (error) {
        console.error("Error al agregar tarea: ", error);
      }
    },

    /**
     * ACTUALIZAR (Update) - Marcar como "hecha"
     */
    async TareaHecho(id) {
      try {
        // Buscamos la tarea en el array local para saber su estado actual
        let tarea = this.tareas.find(t => t.id === id);
        
        if (tarea) {
          // 1. Creamos la referencia al documento
          const docRef = doc(db, 'tareas', id);
          
          // 2. Usamos 'updateDoc' para cambiar solo el campo 'hecho'
          await updateDoc(docRef, {
            hecho: !tarea.hecho // Invertimos el valor (true/false)
          });
          // 'onSnapshot' detectará este cambio.
        }
      } catch (error) {
        console.error("Error al actualizar 'hecho': ", error);
      }
    },

    /**
     * BORRAR (Delete)
     */
    async BorrarTarea(id) {
      if (confirm("¿Deseas eliminar el registro?")) {
        try {
          // 1. Creamos la referencia al documento
          const docRef = doc(db, 'tareas', id);
          
          // 2. Usamos 'deleteDoc' para borrarlo
          await deleteDoc(docRef);
          
          // 'onSnapshot' detectará este borrado.
        } catch (error) {
          console.error("Error al borrar tarea: ", error);
        }
      }
    },

    // --- Métodos de Edición (Casi sin cambios) ---

    // Esto es lógica local, no toca Firebase.
    iniciarEdicion(tarea) {
      this.tareaAEditar = tarea; 
      this.nuevoTituloEditado = tarea.titulo; 
      this.dialogoEditar = true; 
    },

    // Esto es lógica local, no toca Firebase.
    cancelarEdicion() {
      this.dialogoEditar = false;
      this.tareaAEditar = null;
      this.nuevoTituloEditado = "";
    },

    /**
     * ACTUALIZAR (Update) - Guardar nuevo título
     */
    async guardarEdicion() {
      if (this.nuevoTituloEditado.trim() === "" || !this.tareaAEditar) {
        this.cancelarEdicion();
        return;
      }
      
      try {
        // 1. Creamos la referencia al documento
        const docRef = doc(db, 'tareas', this.tareaAEditar.id);
        
        // 2. Usamos 'updateDoc' para cambiar solo el 'titulo'
        await updateDoc(docRef, {
          titulo: this.nuevoTituloEditado
        });
        
        // 'onSnapshot' detectará este cambio.
      } catch (error) {
        console.error("Error al guardar edición: ", error);
      }
      
      this.cancelarEdicion(); // Cerramos el diálogo
    }
  }
}
</script>

<style scoped>
/* Añadimos el estilo para la clase '.blue' que usa
  el v-list-item cuando 'tarea.hecho' es true.
  'scoped' significa que este estilo solo aplica a 
  este componente.
*/
.blue {
  background-color: #E3F2FD; /* Un azul pálido de Vuetify */
}
</style>