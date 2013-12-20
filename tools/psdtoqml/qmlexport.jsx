/*
 * Crotocos::qmlexport.jsx
 */

// @include "qmlfile.jsx"
// @include "pngexport.jsx"
// @include "layerproxy.jsx"

function QmlExport(path, document)
{
    this.path = path;
    this.document = document;
    
    // Класс для экспорта png-файлов
    this.pngExport = new PngExport(path, document);
    
    // Основной qmlfile
    var qmlfile = new QmlFile(this.path + "/main.qml");
    qmlfile.writeLine("import QtQuick 2.1");
    qmlfile.writeEmptyLine();
    qmlfile.startElement("Item", "root", document.name);
        qmlfile.writeProperty("width", document.width.as("px"));
        qmlfile.writeProperty("height", document.height.as("px"));
        this.doExportLayers(qmlfile, undefined, this.document.layers);
    qmlfile.endElement();
}

QmlExport.prototype.itemCounter = 0;

QmlExport.prototype.doExportLayers = function(qmlfile, parent, layers)
{
    for (var index = layers.length - 1; index >= 0; index--)
    {
        var layer = layers[index];
  
        // Не видимые слои сохранять не будем
        if (!layer.visible)
        {
            continue;
        }
    
        var layerProxy = new LayerProxy(parent, layer);
            
        // Получаем имя qml-типа
        var qmltype = layerProxy.qmlType();      
        if (qmltype.size == 0)
        {
            continue;
        }
    
        // Пока запичываем все элементы с именами item1, item2, item3
        // - в именах встречаются русские буквы и пробелы и их надо
        // конвертировать
        this.itemCounter++;
        qmlfile.writeEmptyLine();
        qmlfile.startElement(qmltype, "item" + this.itemCounter, layerProxy.layer.name);
        
        qmlfile.writeProperty("x", layerProxy.x);
        qmlfile.writeProperty("y", layerProxy.y);
        
        if(layerProxy.layer.typename == "LayerSet")
        {
            this.doExportLayers(qmlfile, layerProxy, layerProxy.layer.layers);
        }
        else
        {
            var layer = layerProxy.layer;
            
            switch (qmltype)
            {
            case "Image":
                qmlfile.writeStringProperty("source", this.pngExport.save(layer));
                break;
            
            case "Text":
                qmlfile.writeStringProperty("font.family", layer.textItem.font);
                qmlfile.writeColor("color", layer.textItem.color);
                qmlfile.writeStringProperty("text", layer.textItem.contents);
                break;
            }
        }
        
        qmlfile.endElement();
    }
}
