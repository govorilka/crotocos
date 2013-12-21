/*
 * Crotocos::psdtoqml.jsx
 * Скрипт для экпорта psd-файла в qml
 */
#target photoshop

// @include "src/qmlexport.jsx"

// Получение имени директории, куда будем экпортировать содержимое файла
function directoryName(params)
{
    var chooseDirectoryDlg = new Window('dialog', 'Экпорт QML файлов...');
    
    // Поле для ввода пути к QML-файлам
    chooseDirectoryDlg.groupFirstLine = chooseDirectoryDlg.add("group");
    chooseDirectoryDlg.groupFirstLine.orientation = 'row';
    chooseDirectoryDlg.groupFirstLine.alignChildren = 'left';
    chooseDirectoryDlg.groupFirstLine.alignment = 'fill';
  
    chooseDirectoryDlg.outputName = chooseDirectoryDlg.groupFirstLine.add("edittext", undefined, "");
    chooseDirectoryDlg.outputName.preferredSize.width = 220;
    
    chooseDirectoryDlg.outputName.buttonBrowse = chooseDirectoryDlg.groupFirstLine.add("button", undefined, "...");
    chooseDirectoryDlg.outputName.buttonBrowse.onClick = function ()  {
        var selFolder = Folder.selectDialog("Путь к QML-файлам", "~");
        if (selFolder != null)
        {
            chooseDirectoryDlg.outputName.text = selFolder.fsName;
        }
    }

    // Галочка "Использовать имена слоёв"
    chooseDirectoryDlg.groupUseLayerName = chooseDirectoryDlg.add("group");
    chooseDirectoryDlg.groupUseLayerName.orientation = 'row';
    chooseDirectoryDlg.groupUseLayerName.alignChildren = 'left';
    chooseDirectoryDlg.groupUseLayerName.alignment = 'fill';
    
    chooseDirectoryDlg.useLayerName_checkbox = chooseDirectoryDlg.groupUseLayerName.add("checkbox", undefined, "Использовать имена слоёв");
    
    // Кнопки Ok и "Отмена"
    chooseDirectoryDlg.groupButtonsLine = chooseDirectoryDlg.add("group");
    chooseDirectoryDlg.groupButtonsLine.orientation = 'row';
    chooseDirectoryDlg.groupButtonsLine.alignChildren = 'right';
    chooseDirectoryDlg.groupButtonsLine.alignment = 'right';
        
    chooseDirectoryDlg.buttonOk = chooseDirectoryDlg.groupButtonsLine.add("button", undefined, "Ok");
    chooseDirectoryDlg.buttonOk.onClick = function () {
  
        var destination = chooseDirectoryDlg.outputName.text;
        
        if (destination.length == 0)
        {
            alert("Вы должны указать директорию.");
            return;
        }

        var testFolder = new Folder(destination);
        if (!testFolder.exists)
        {
            alert("Указанная директория не существует.");
            return;
        }
    
        params.path = destination;
        params.useLayerName = chooseDirectoryDlg.useLayerName_checkbox.value;
        
        chooseDirectoryDlg.close(1);
    }

    chooseDirectoryDlg.buttonCancel = chooseDirectoryDlg.groupButtonsLine.add("button", undefined, "Отмена");
    chooseDirectoryDlg.buttonCancel.onClick = function () {
        chooseDirectoryDlg.close(0);
    }

    return chooseDirectoryDlg.show() == 1 ? true : false;
}

///////////////////////////////////////////////////////////////////////////////

function main()
{
    // Устанавливаем единицы измерения для линейки - пиксели
    app.preferences.rulerUnits = Units.PIXELS;
    
    var documentName = app.activeDocument.name;
    app.activeDocument = app.documents[documentName];
    
    var params = new QmlExportParams();
    if (directoryName(params) && params.path.size != 0)
    {
        var qmlExport = new QmlExport(params, app.activeDocument);
    }
}

main();
