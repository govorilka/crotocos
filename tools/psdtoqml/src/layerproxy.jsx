/*
 * Crotocos::psdlayerproxy.jsx
 */

function LayerProxy(parent, layer)
{
    this.parent = parent;
    this.layer = layer;
    
    // 1. Вычисляем координаты элемента
    var parentX = 0;
    var parentY = 0;
    if (this.parent !== undefined)
    {
        parentX = this.parent.documentX;
        parentY = this.parent.documentY;
    }

    this.documentX = 0;
    this.documentY = 0;
    this.width = 0;
    this.height = 0;

    var bounds = this.layer.bounds;
    if (bounds !== undefined)
    {
       this.documentX = bounds[0].as("px");
       this.documentY = bounds[1].as("px");
       this.width = bounds[2].as("px") - bounds[0].as("px");
       this.height = bounds[3].as("px") - bounds[1].as("px");
    }

    this.x = this.documentX - parentX;
    this.y = this.documentY - parentY;
    
    // 2. Вычисляем id для нового элемента 
    if (this.namePattern.test(this.layer.name))
    {
        var id = this.layer.name;
        var firstChar = id.substr(0, 1).toLocaleLowerCase();
        
        this.itemId = firstChar + id.substr(1, id.length - 1);
        this.itemComment = "";
    }
    else
    {
        LayerProxy.itemCounter++;
        this.itemId = "item" + LayerProxy.itemCounter;
        this.itemComment = this.layer.name;
    }

    // 3. x и y для текстового поля
    this.pointText = 
        this.layer.typename == "ArtLayer" 
            && this.layer.kind == LayerKind.TEXT
            && this.layer.textItem.kind == TextType.POINTTEXT;
    if (this.pointText)
    {
        var textItem = this.layer.textItem;
     
        this.textX = textItem.position[0].as("px") - parentX;        
        this.textY = textItem.position[1].as("px") - parentY;
        
        try
        {
            this.textX += textItem.leftIndent.as("px");
        }
        catch(e){}
    }
}

//  RegExp проверяющий название экпортируемого слоя
LayerProxy.prototype.namePattern = /^[a-zA-Z$][0-9a-zA-Z_$]*$/; 

// Счётчик для генерации имен переменных
LayerProxy.itemCounter = 0;

LayerProxy.prototype.qmlType = function()
{
    if(this.layer.typename == "LayerSet")
    {
        return "Item";
    }

    if (this.layer.typename == "ArtLayer" && this.layer.kind !== undefined)
    {
        switch(this.layer.kind)
        {
        case LayerKind.TEXT:
            return "Text";
        }
    }

    // По умолчанию все слои будем сохранять, как картинки
    return "Image";
}

LayerProxy.prototype.idToQmlType = function(id)
{
   var firstChar = id.substr(0, 1).toLocaleUpperCase();
   return firstChar + id.substr(1, id.length - 1);
}

LayerProxy.prototype.fullName = function(separator)
{
    if (this.parent !== undefined)
    {
        return this.parent.fullName(separator) + separator + this.itemId;
    }
    return this.itemId;
}
