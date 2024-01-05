import { apiUrl } from "../../config";

interface UserCredentials{
    username: string;
    password: string;
}

export async function loginUser(userObject: UserCredentials, callback: (res: any) => void) {
    //console.log(userObject)
    await fetch((apiUrl as string) + "/login", 
    {
      method: "POST",
      credentials: 'include',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(userObject),
    }).then((response) => response.json())
    .then(function (data) {
      callback(data);
    })
    .catch(function (error) {
      console.log(error);
    })
}
