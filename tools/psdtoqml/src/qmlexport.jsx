﻿/*
 * Crotocos::qmlexport.jsx
 */

// @include "qmlfile.jsx"
// @include "qmldirfile.jsx"
// @include "pngexport.jsx"
// @include "layerproxy.jsx"

function QmlExportParams()
{
    this.path = "";
    this.useIndividualFile = true;
}

function QmlExport(params, document)
{
    this.params = params;
    this.document = document;
        
    // Файл qmldir
    this.qmldir = new QmlDirFile(this.params.path + "/qmldir");

    // Класс для экспорта png-файлов
    this.pngExport = new PngExport(this.params.path, document);
    
    //Файл проекта, чтобы нормально открыть все в QtCreator'e
    var qmlfile = new QmlFile(this.params.path + "/main.qmlproject");
    qmlfile.writeLine("import QmlProject 1.0");
    qmlfile.writeEmptyLine();
    qmlfile.startElement("Project", "", "");
    
        qmlfile.writeStringProperty("mainFile", "main.qml");
        
        qmlfile.writeEmptyLine();
        qmlfile.startElement("QmlFiles", "", "");
            qmlfile.writeStringProperty("directory", ".");
        qmlfile.endElement();
        
        qmlfile.writeEmptyLine();
        qmlfile.startElement("JavaScriptFiles", "", "");
            qmlfile.writeStringProperty("directory", ".");
        qmlfile.endElement();
        qmlfile.writeEmptyLine();
        
        qmlfile.writeEmptyLine();
        qmlfile.startElement("ImageFiles", "", "");
            qmlfile.writeStringProperty("directory", ".");
        qmlfile.endElement();
 
    qmlfile.endElement();
    
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
                
        qmlfile.writeEmptyLine();

        if (layerProxy.pointText)
        {
            this.doExportPointTextLayer(qmlfile, layerProxy);
            continue;
        }
    
        if (layerProxy.paragraphText)
        {
            this.doExportParagraphTextLayer(qmlfile, layerProxy);
            continue;
        }
    
        // Получаем имя qml-типа
        var qmltype = layerProxy.qmlType();      
        if (qmltype.size == 0)
        {
            continue;
        }
    
        // Записываем новый элемент        
        if (this.params.useIndividualFile && layerProxy.layer.typename == "LayerSet")
        {
            qmltype = layerProxy.idToQmlType(layerProxy.itemId);
        }
        
        qmlfile.startElement(qmltype, layerProxy.itemId, layerProxy.itemComment);
        
        this.doExportOpacity(qmlfile, layerProxy);
        
        qmlfile.writeProperty("x", layerProxy.x);
        qmlfile.writeProperty("y", layerProxy.y);
        
        if(layerProxy.layer.typename == "LayerSet")
        {
            if (this.params.useIndividualFile)
            {
                this.qmldir.writeType(qmltype, "1.0", qmltype + ".qml");
                
                // Отдельный файл для папки
                var itemQmlfile = new QmlFile(this.params.path + "/" + qmltype + ".qml");
                itemQmlfile.writeLine("import QtQuick 2.1");
                itemQmlfile.writeEmptyLine();
                    itemQmlfile.startElement("Item", "root", layerProxy.itemId);
                    itemQmlfile.writeProperty("width", layerProxy.width);
                    itemQmlfile.writeProperty("height", layerProxy.height);
                    this.doExportLayers(itemQmlfile, layerProxy, layerProxy.layer.layers);
                itemQmlfile.endElement();
            }
            else
            {
                // Для "папок" мы записываем также размеры, чтобы было проще
                // потом верстать
                qmlfile.writeProperty("width", layerProxy.width);
                qmlfile.writeProperty("height", layerProxy.height);
                
                this.doExportLayers(qmlfile, layerProxy, layerProxy.layer.layers);
            }
        }
        else
        {        
            switch (qmltype)
            {
                case "Image":
                qmlfile.writeStringProperty("source", this.pngExport.save(layerProxy));
                qmlfile.writeSize("sourceSize", layerProxy.width, layerProxy.height);
                break;

                case "Text":
                this.doExportTextLayer(qmlfile, layerProxy);
                break;
            }
        }
        
        qmlfile.endElement();        
    }
}

QmlExport.prototype.doExportParagraphTextLayer = function(qmlfile, layerProxy)
{
    var textItem = layerProxy.layer.textItem;
 
    qmlfile.startElement("Text", layerProxy.itemId, layerProxy.itemComment);
    
        qmlfile.writeProperty("x", layerProxy.textX);
        qmlfile.writeProperty("y", layerProxy.textY);
    
        qmlfile.writeProperty("width", textItem.width.as("px"));
        qmlfile.writeProperty("height", textItem.height.as("px"));
        qmlfile.writeProperty("wrapMode", "Text.WordWrap");
        
        this.doExportTextStyle(qmlfile, textItem);
 
        qmlfile.writeStringProperty("text", textItem.contents);
    
    qmlfile.endElement(); 
}

QmlExport.prototype.doExportPointTextLayer = function(qmlfile, layerProxy)
{
    var textItem = layerProxy.layer.textItem;
    
    var anchorsItemId = layerProxy.itemId + "Anchor";
    
    var horizontalAnchor = "anchors.left";
    try 
    {
        // Выравнивание может быть не задано. Тогда при обращение к свойству
        // будет сгенерировано исключение
        switch (textItem.justification)    
        {
        case Justification.LEFT:
            horizontalAnchor = "anchors.left";
            break;
     
        case Justification.RIGHT:
            horizontalAnchor = "anchors.right";
            break;
            
        case Justification.CENTER:
            horizontalAnchor = "anchors.horizontalCenter";
            break; 
        
        default:
            horizontalAnchor = "anchors.left";
        }
    }
    catch(e){}

    qmlfile.startElement("Item", anchorsItemId, "Anchor item for " + layerProxy.itemId);
        qmlfile.writeProperty("x", layerProxy.textX);
        qmlfile.writeProperty("y", layerProxy.textY - layerProxy.height);
        qmlfile.writeProperty("width", layerProxy.width);
        qmlfile.writeProperty("height", layerProxy.height);
    qmlfile.endElement();
    
    qmlfile.startElement("Text", layerProxy.itemId, layerProxy.itemComment);
    
        this.doExportOpacity(qmlfile, layerProxy);
    
        qmlfile.writeProperty(horizontalAnchor, anchorsItemId + ".left");
        qmlfile.writeProperty("anchors.baseline", anchorsItemId + ".bottom");
        
        this.doExportTextStyle(qmlfile, textItem);
                 
        qmlfile.writeStringProperty("text", textItem.contents);
        
    qmlfile.endElement();
}

QmlExport.prototype.doExportTextStyle = function(qmlfile, textItem)
{
    var font = app.fonts.getByName(textItem.font);
    qmlfile.writeStringProperty("font.family", font !== undefined ? font.family : textItem.font);
    
    qmlfile.writeProperty("font.pixelSize", textItem.size.as("px"));
    try
    {
        // Цвет текста может быть не задан. Тогда при обращении к свойству
        // будет сгенерировано исключение
        qmlfile.writeColor("color", textItem.color);
    }
    catch(e){}
}   

QmlExport.prototype.doExportOpacity = function(qmlfile, layerProxy)
{
    // Значение прозрачности. В Photoshop'е оно задаётся 
    // значением от 0 до 100 в процентах. Если значение прозрачности
    // не равно 100%, то мы записываем его в файл.
    var opacity = layerProxy.layer.opacity;
    if (opacity != 100.0)
    { 
        qmlfile.writeProperty("opacity", opacity / 100.0);
    }
}