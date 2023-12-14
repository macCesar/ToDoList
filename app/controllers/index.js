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
