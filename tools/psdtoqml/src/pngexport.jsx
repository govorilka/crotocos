/*
 * Crotocos::pngexport.jsx
 */

function PngExport(path, useLayerName, document)
{
    this.path = path;
    this.useLayerName = useLayerName;
    this.document = document;
    this.fileCounter = 0;
}

// Сохраняем все картинки в формате png
PngExport.prototype.options = new ExportOptionsSaveForWeb();
PngExport.prototype.options.format = SaveDocumentType.PNG;
PngExport.prototype.options.PNG8 = false;
PngExport.prototype.options.transparency = true;
PngExport.prototype.options.optimized = true;

// Файлы будут иметь имена image1, image2, image3
// Для этого заводим специальный счетчик.
PngExport.prototype.fileCounter = 0; 

PngExport.prototype.save = function(layer)
{
    var filename;
    if (this.useLayerName)
    {
        filename = 'images/' + layer.name + '.png';
    }
    else
    {
        this.fileCounter++;
        filename = 'images/i' + this.fileCounter +'.png';
    }
 
    var width = layer.bounds[2].as("px") - layer.bounds[0].as("px");
    var height = layer.bounds[3].as("px") - layer.bounds[1].as("px");
    
    var oldActiveDocument = app.activeDocument;
    
    // Добавляем временный документ
    var tmpDocument = app.documents.add(
        width,  // Ширина 
        height, // Высота
        this.document.resolution, // Разрешение
        "tmpDocument",
        NewDocumentMode.RGB,
        DocumentFill.TRANSPARENT,
        this.document.pixelAspectRatio,
        this.document.bitsPerChannel,
        this.document.colorProfileName
    );
  
    // Копируем слой во временный документ
    app.activeDocument = this.document;
    newLayer = layer.duplicate(tmpDocument, ElementPlacement.INSIDE);
    
    // Устанавливаем слой по центр временного документа
    app.activeDocument = tmpDocument;
    
    newLayer.positionLocked = false;
    newLayer.opacity = 100.0;
    newLayer.translate(-layer.bounds[0], -layer.bounds[1]);

    // Создаём папку images, если она не существует. В эту папку будем сохранять png-файлы
    var folder = new Folder(this.path + "images/");
    if (folder.exists || folder.create())
    {
        // Сохраняем временный документ в формате PNG        
        var pngFile = new File(this.path + filename);
        tmpDocument.exportDocument(pngFile, ExportType.SAVEFORWEB, this.options);
    }
    else
    {
        // Папка для картинок не существует и мы не смогли её создать. Поэтому, 
        // вернём из функции пустую строку
        filename = "";
    }
 
    // Закрываем временный документ, без сохранения изменений
    tmpDocument.close(SaveOptions.DONOTSAVECHANGES);
    
    // Восстанавдиваем прежний активный документ
    app.activeDocument = oldActiveDocument;
    
    return filename;
}
