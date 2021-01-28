class Recorder {
    constructor(userName, stream) {
        this.userName = userName
        this.stream = stream

        this.filename = `id:${userName}-when:${Date.now()}`
        this.videoType = 'video/webm'
    }
    _setup() {
        const commomCodecs = [
            "codecs=vp9,opus",
            "codecs=vp8,opus",
            ""
        ]

        const options = commomCodecs
            .map(codec => ({ mimeType: `${this.videoType};${codec}`}))
            .find(options => MediaRecorcer.isTypeSupported(options.mimeType))
        
        if(!options) {
            throw new Error(`none of the codecs: ${commomCodecs.join(',')} are supported.`)

        }
        
        return options
    }

    startRecording() {
        console.log('lul')
        // caso não estiver recebendo mais vídeos, é ignorado
        const options = this._setup()
        
    }
}