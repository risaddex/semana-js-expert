const onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const room = urlParams.get('room');
  console.log('this is the room', room)

  const socketUrl = 'http://localhost:3000'
  const socketBuilder = new SocketBuilder({ socketUrl })
  
  const peerConfig = Object.values({
    id: undefined,
    config: {
      port: 9000,
      host: 'localhost',
      path: '/'
    }
  })
  const peerBuilder = new PeerBuilder({ peerConfig })

  const view = new View()
  const media = new Media()
  const deps = {
    view,
    media,
    room,
    socketBuilder,
    peerBuilder
  }
  // view.renderVideo({userId: 'teste01', url: 'https://media.giphy.com/media/kMdlyJ74u9khW/giphy.mp4' })
  // view.renderVideo({userId: 'teste02', isCurrentId:true, url: 'https://media.giphy.com/media/kMdlyJ74u9khW/giphy.mp4' })
  // view.renderVideo({userId: 'teste03', url: 'https://media.giphy.com/media/kMdlyJ74u9khW/giphy.mp4' })

  Business.initialize(deps)
}

window.onload = onload