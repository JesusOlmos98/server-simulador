export const EnvConfiguration = () => ({

    tcpPort: parseInt(process.env.TCP_PORT || "8010"),
    httpPort: parseInt(process.env.HTTP_PORT || "3000"),

})

//DESTINY_PORT=8010 # 8020 o 8010
