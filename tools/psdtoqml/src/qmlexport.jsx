/*
 * Crotocos::qmlexport.jsx
 */

// @include "qmlfile.jsx"
// @include "pngexport.jsx"
// @include "layerproxy.jsx"

function QmlExportParams()
{
    this.path = "";
    this.useLayerName = false;
}

function QmlExport(params, document)
{
    this.params = params;
    this.document = document;
    
    // Класс для экспорта png-файлов
    this.pngExport = new PngExport(this.params.path, this.params.useLayerName, document);
    
    // Основной qmlfile
    var qmlfile = new QmlFile(this.params.path + "/main.qml");
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
    
        // Записываем новый элемент
        var itemId;
        var itemComment;
        if (this.params.useLayerName)
        {
            itemId = layerProxy.layer.name;
            itemComment = "";
        }
        else
        {
            this.itemCounter++;    
            itemId = "item" + this.itemCounter;
            itemComment = layerProxy.layer.name;
        }
    
        qmlfile.writeEmptyLine();
        qmlfile.startElement(qmltype, itemId, itemComment);
        
        qmlfile.writeProperty("x", layerProxy.x);
        qmlfile.writeProperty("y", layerProxy.y);
        
        // Значение прозрачности. В Photoshop'е оно задаётся 
        // значением от 0 до 100 в процентах. Если значение прозрачности
        // не равно 100%, то мы записываем его в файл.
        var opacity = layerProxy.layer.opacity;
        if (opacity != 100.0)
        { 
            qmlfile.writeProperty("opacity", opacity / 100.0);
        }
        
        if(layerProxy.layer.typename == "LayerSet")
        {
            // Для "папок" мы записываем также размеры, чтобы было проще
            // потом верстать
            qmlfile.writeProperty("width", layerProxy.width);
            qmlfile.writeProperty("height", layerProxy.height);
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
                qmlfile.writeProperty("font.pointSize", layer.textItem.size.as("pt"));
                qmlfile.writeColor("color", layer.textItem.color);
                qmlfile.writeStringProperty("text", layer.textItem.contents);
                break;
            }
        }
        
        qmlfile.endElement();
    }
}
