class CodeChunk {
    constructor(type, name, content, location) {
        this.type = type;
        this.name = name;
        this.content = content;
        this.location = location;
    }
}
module.exports = CodeChunk