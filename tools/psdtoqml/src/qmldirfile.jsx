/*
 * Crotocos::QmlDirFile.jsx
 */

function QmlDirFile(filename)
{
    // Открываем файл для записи
    this.file = new File(filename);
    this.file.encoding = "UTF8";
    this.file.open("w", "TEXT", "");
}

QmlDirFile.prototype.writeType = function(type, version, file)
{
    this.file.write(type + " " + version + " " + file + "\n");
}
