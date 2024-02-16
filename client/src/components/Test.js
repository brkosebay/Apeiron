const provider = new ethers.providers.Web3Provider(window.ethereum);

    // get the end user
    const signer = provider.signer();
    
    // get the smart contract
    
    const contract = new ethers.Contract(contractAddress, Apeiron.abi, signer);
    
    const mintToken = async () => {
        const connection = contract.connect(signer);
        const addr = connection.address;
        const metadata = ""
        const result = await contract.publicMint(metadata,{value: ethers.utils.parseEther('0.001')});
        await result.wait();
    
    }