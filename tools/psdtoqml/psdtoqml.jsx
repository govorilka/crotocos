/*
 * Crotocos.jsx
 * Скрипт для экпорта psd-файла в qml
 */
#target photoshop

///////////////////////////////////////////////////////////////////////////////

function QmlFile(filename)
{
    // Открываем файл для записи
    this.file = new File(filename);
    this.file.encoding = "UTF8";
    this.file.open("w", "TEXT", "");
        
    this.lineSpaceCount = 0;
    this.lineSpace = "";
}

QmlFile.prototype.writeLine = function(line){
    this.file.write(this.lineSpace + line + "\n");
}

QmlFile.prototype.startElement = function(className){
    this.file.write(this.lineSpace + className + " { \n");
    this.lineSpaceCount += 4;
    this.lineSpace = new Array(this.lineSpaceCount + 1).join(" ");
}

QmlFile.prototype.startElementWithId = function(className, id){
    this.startElement(className);
    this.writeProperty("id", id);
}

QmlFile.prototype.endElement = function(){
    this.lineSpaceCount -= 4;
    this.lineSpace = new Array(this.lineSpaceCount + 1).join(" ");
    this.file.write(this.lineSpace + "}\n");
}

QmlFile.prototype.writeProperty = function(property, value){
    this.file.write(this.lineSpace + property + ": " + value + "\n");
}

QmlFile.prototype.writeEmptyLine = function(){
    this.file.write("\n");
}

///////////////////////////////////////////////////////////////////////////////

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

function doExportLayers(qmlfile, layers)
{
    var count = layers.length;
    for (var index  = 0; index < count; index++)
    {
        var layer = layers[index];
        if (layer.visible)
        {
            if(layer.typename == "LayerSet")
            {
                doExportLayerSet(qmlfile, layer);
            }
            else if(layer.typename == "ArtLayer")
            {
                doExportArtLayer(qmlfile, layer);
            }  
        }
    }
}

function doExportLayerSet(qmlfile, layer)
{
    qmlfile.writeEmptyLine();
    qmlfile.startElementWithId("Item", layer.name);
    
    doExportLayers(qmlfile, layer.layers);
    
    qmlfile.endElement();
}

function doExportArtLayer(qmlfile, layer)
{
    if (layer.kind !== undefined)
    {
        if (layer.kind == LayerKind.TEXT)
        {
            doExportText(qmlfile, layer);
            return;
        }
    }

    qmlfile.writeEmptyLine();
    qmlfile.startElementWithId("Item", layer.name);
    qmlfile.endElement();
}

function doExportText(qmlfile, layer)
{
    qmlfile.writeEmptyLine();
    qmlfile.startElementWithId("Text", layer.name); 
        var textItem = layer.textItem;
        qmlfile.writeProperty("font", textItem.font);
        qmlfile.writeProperty("color", textItem.color);
        qmlfile.writeProperty("text", textItem.contents);
    qmlfile.endElement();
}

///////////////////////////////////////////////////////////////////////////////

// Экпортируем содердимое PSD файла
function doExport(dirname, document)
{
    var outputName = dirname + "/" + "main.qml";
     
    var qmlfile = new QmlFile(outputName);
    qmlfile.writeLine("import QtQuick 2.1");
    qmlfile.writeEmptyLine();
    
    qmlfile.startElement("Item");
        qmlfile.writeProperty("width", document.width.as("px"));
        qmlfile.writeProperty("height", document.height.as("px"));
        doExportLayers(qmlfile, document.layers);
    qmlfile.endElement();
}



function main()
{
    // Устанавливаем единицы измерения для линейки - пиксели
    app.preferences.rulerUnits = Units.PIXELS;
    
    var documentName = app.activeDocument.name;
    app.activeDocument = app.documents[documentName];
    
    var dirName = directoryName();
    if(dirName.size != 0){
        doExport(dirName, app.activeDocument);
    }
}

main();
