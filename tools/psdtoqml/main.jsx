/*
 * Crotocos::psdtoqml.jsx
 * Скрипт для экпорта psd-файла в qml
 */
#target photoshop

// @include "src/qmlexport.jsx"

// Получение имени директории, куда будем экпортировать содержимое файла
function directoryName()
{
    var chooseDirectoryDlg = new Window('dialog', 'Директория для экпорта QML файлов...');
    
    chooseDirectoryDlg.groupFirstLine =  chooseDirectoryDlg.add("group");
    chooseDirectoryDlg.groupFirstLine.orientation = 'row';
    chooseDirectoryDlg.groupFirstLine.alignChildren = 'left';
    chooseDirectoryDlg.groupFirstLine.alignment = 'fill';
    
    // Поле для ввода пути к QML-файлам
    chooseDirectoryDlg.outputName = chooseDirectoryDlg.groupFirstLine.add("edittext", undefined, "");
    chooseDirectoryDlg.outputName.preferredSize.width = 220;
    
    chooseDirectoryDlg.outputName.buttonBrowse =chooseDirectoryDlg.groupFirstLine.add("button", undefined, "...");
    chooseDirectoryDlg.outputName.buttonBrowse.onClick = function ()  {
        var selFolder = Folder.selectDialog("Путь к QML-файлам", "~");
        if (selFolder != null)
            chooseDirectoryDlg.outputName.text = selFolder.fsName;
    }
        
    chooseDirectoryDlg.buttonOk = chooseDirectoryDlg .add("button", undefined, "Ok");
    chooseDirectoryDlg.buttonOk = function () {
  
        var destination = chooseDirectoryDlg.outputName.text;
        if (destination.length == 0){
            alert("Вы должны указать директорию.");
            return;
        }

        var testFolder = new Folder(destination);
        if (!testFolder.exists) {
            alert("Указанная директория не существует.");
            return;
        }
        chooseDirectoryDlg.close(1);
     }
    
    chooseDirectoryDlg.buttonCancel = chooseDirectoryDlg .add("button", undefined, "Отмена");
    chooseDirectoryDlg.buttonCancel.onClick = function () {
          chooseDirectoryDlg.close(0);
    }
 
    return chooseDirectoryDlg.show() == 1 ? chooseDirectoryDlg.outputName.text : "";
}

///////////////////////////////////////////////////////////////////////////////

function main()
{
    // Устанавливаем единицы измерения для линейки - пиксели
    app.preferences.rulerUnits = Units.PIXELS;
    
    var documentName = app.activeDocument.name;
    app.activeDocument = app.documents[documentName];
    
    var dirName = directoryName();
    if(dirName.size != 0){
        var qmlExport = new QmlExport(dirName, app.activeDocument);
    }
}

main();
