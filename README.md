# Base de Datos de Modelos Backbone con Titanium Alloy

*Este es un ejemplo rápido de desarrollo de aplicaciones móviles sobre cómo integrar modelos backbone con Titanium en Alloy.*

<p align="center">
  <img src="./app/assets/imagen2.jpg" alt="Portada">
</p>

Desde el lanzamiento del complemento Alloy, el desarrollo en Titanium ha sido extremadamente simple y rápido. En este tutorial, te mostraré cómo implementar una base de datos local con modelos backbone en 5 sencillos pasos.

## Paso 1
Crea un nuevo proyecto de aplicación móvil, llámalo `ToDoList` y ábrelo en tu editor favorito.

```bash
ti create --name ToDoList --type app --alloy
```

## Paso 2
Creemos un nuevo modelo llamado `toDoList`

```bash
alloy generate model toDoList sql id:'INTEGER PRIMARY KEY AUTOINCREMENT' value:TEXT hasCheck:INTEGER
```

```javascript
exports.definition = {
  config: {
    columns: {
      id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
      value: 'TEXT',
      hasCheck: 'INTEGER'
    },
    adapter: {
      type: 'sql',
      collection_name: 'toDoList'
    }
  },
  extendModel: function(Model) {
    _.extend(Model.prototype, {
      // funciones y propiedades extendidas van aquí
    })

    return Model
  },
  extendCollection: function(Collection) {
    _.extend(Collection.prototype, {
      // funciones y propiedades extendidas van aquí

      // Para Backbone v1.1.2, descomenta lo siguiente para anular el
      // método fetch y tener en cuenta un cambio crítico en Backbone.
      /*
        fetch: function(options) {
          options = options ? _.clone(options) : {};
          options.reset = true;
          return Backbone.Collection.prototype.fetch.call(this, options);
        }
        */
    })

    return Collection
  }
}
```

## Paso 3
El siguiente paso es crear la interfaz de usuario, ve al archivo `index.xml` e inserta este código:

```xml
<Alloy>
  <!-- Instancia del modelo -->
  <Collection src="toDoList" />

  <NavigationWindow>
    <Window title="ToDo App">
      <View id="insertView">
        <TextField id="inputField" onReturn="doInsert" />
        <Button id="insertButton" title="Insertar" onClick="doInsert" />
      </View>

      <!-- Especifica el singleton o instancia de la colección para vincular a la tabla. -->
      <TableView id="tbToDoList" dataCollection="toDoList" onSingletap="checkUncheckRow" onLongpress="confirmDialog">
        <!-- rowId="{id}" es una propiedad personalizada para tener una referencia a la clave principal de los registros -->
        <TableViewRow id="listRow" rowId="{id}" hasCheck="{hasCheck}">
          <View id="componentView">
            <!-- text="{value}" es el valor del registro de la base de datos -->
            <Label id="lblValue" text="{value}" />
          </View>
        </TableViewRow>
      </TableView>

      <AlertDialog id="alertDialog" cancel="1" message="Eliminar" onClick="confirmRemoveRow">
        <ButtonNames>
          <ButtonName>Sí</ButtonName>
          <ButtonName>No</ButtonName>
        </ButtonNames>
      </AlertDialog>
    </Window>
  </NavigationWindow>
</Alloy>
```

## Paso 4
Ve al archivo `index.css` e inserta los siguientes estilos:

```scss
'Window': {
  layout: 'vertical',
  extendSafeArea: false,
  backgroundColor: '#ffffff',
}

'TextField': {
  height: 40,
  width: '75%',
  borderWidth: 1,
  borderRadius: 6,
  clearOnEdit: true,
  autocorrect: false,
  borderColor: 'gray',
  backgroundColor:  '#f2f2f2',
  padding: { left: 10, right: 10 },
  textAlign: Ti.UI.TEXT_ALIGNMENT_LEFT
}

'Button': {
  height: 40,
  width: '25%',
}

'TableView': {
  top: 10,
  widht: Ti.UI.FILL,
  height: Ti.UI.FILL
}

'TableViewRow': {
  height: 40,
  hasCheck: false,
  width: Ti.UI.FILL
}

'Label': {
  left: 0,
  color: 'black',
  font: { fontSize: 14, fontFamily: 'HelveticaNeue' }
}

'#insertView': {
  top: 10,
  left: 10,
  right: 10,
  height: Ti.UI.SIZE,
  layout: 'horizontal'
}

'#componentView': {
  left: 10,
  width: '90%',
  height: Ti.UI.FILL
}
```

## Paso 5
Aquí está la parte divertida: el archivo `index.js`:

```javascript
// Abre la ventana
$.index.open()

// Restablece el estado del modelo desde la base de datos.
Alloy.Collections.toDoList.fetch()

function doInsert() {
  // Oculta el teclado en iOS
  $.inputField.blur()

  // si hay algo en el cuadro de texto
  if ($.inputField.value.trim() !== '') {

    // Así es como creamos una instancia de un modelo y lo guardamos en la base de datos.
    // Si el modelo ya existe, la operación será una "actualización".
    Alloy.createModel('toDoList', {
      hasCheck: false,
      value: $.inputField.value.trim()
    }).save()

    $.inputField.value = ''

    // Restablece el estado del modelo desde la base de datos
    Alloy.Collections.toDoList.fetch()

  } else {
    alert('Por favor, completa el campo de texto arriba.')
  }
}

// Check/Uncheck
function checkUncheckRow(event) {
  if (event.row) {
    // Método de fábrica para instanciar una colección Backbone de objetos modelo
    let todoModel = Alloy.createCollection('toDoList')

    // Buscamos el modelo por su id que está guardado en rowId
    todoModel.fetch({ query: `SELECT * FROM toDoList WHERE id = ${event.row.rowId} LIMIT 1` })

    // Aunque solo es un solo resultado ( LIMIT 1 ), la colección es un array de modelos
    todoModel.models.forEach(model => model.save({ hasCheck: !model.get('hasCheck') }))

    // Restablece el estado del modelo desde la base de datos
    Alloy.Collections.toDoList.fetch()
  }
}

// si hacemos una pulsación larga, podemos eliminar la fila
function confirmDialog(event) {
  $.alertDialog.rowId = event.row.rowId
  $.alertDialog.show()
}

function confirmRemoveRow({ index, source }) {
  if (index === 0) {
    // hizo clic en "Sí"
    removeRow(source.rowId)
  }
}

function removeRow(rowId) {
  let todoModel = Alloy.createCollection('toDoList')

  // Buscamos el modelo por su id que está guardado en rowId
  todoModel.fetch({ query: `SELECT * FROM toDoList WHERE id = ${rowId} LIMIT 1` })

  // Aunque solo es un solo resultado ( LIMIT 1 ), la colección es un array de modelos
  todoModel.models.forEach(model => model.destroy())

  // Restablece el estado del modelo desde la base de datos
  Alloy.Collections.toDoList.fetch()
}
```

[Ver artículo en codigomovil.mx](https://codigomovil.mx/blog/base-de-datos-de-modelos-backbone-con-titanium-alloy)
