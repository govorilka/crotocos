/*
 * Crotocos::QmlFile.jsx
 */

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

QmlFile.prototype.writeStringProperty = function(property, value){
    this.file.write(this.lineSpace + property + ": \"" + value + "\"\n");
}

QmlFile.prototype.writeEmptyLine = function(){
    this.file.write("\n");
}
