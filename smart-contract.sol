pragma solidity ^0.4.20;
pragma experimental ABIEncoderV2;

contract filehosting
{
    
    struct File{
      string fileid;
        uint size; //size
       string hash; //hash of 
     string[] version;
    }
   struct Files{
       File [] files;
   }
   mapping(address=>Files)private getfiles;
  mapping(address=> mapping(string=>File)) private users;
  mapping(address=>mapping(string=>mapping(string=>bool))) private hashexists;
  
    function setUser(address x,string y,uint256 size,string  hash) public  //x is the user id y is the file id
    {
        users[x][y].size=size;
        users[x][y].fileid=y;
        
      users[x][y].hash=hash;
    
   
   if(hashexists[x][y][hash]==false){
      users[x][y].version.push(hash);
   hashexists[x][y][hash]=true;
       
   }
      
      getfiles[x].files.push(users[x][y]);
     
       
    }
    function getFile(address x,string y) view public returns (uint256,string) {
        return (users[x][y].size,users[x][y].hash);
    }
    function getVersion(address x,string y) view public returns(string[]) {
        return users[x][y].version;
    }
    function getFilesById(address x) view public returns (File[]){
       return getfiles[x].files;
    }
   

    
}
