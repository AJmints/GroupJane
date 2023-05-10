import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserEntity } from '../../models/UserEntity';
import { ViewUserService } from '../services/view-user.service';
import { VerifyLogoutService } from '../../security/verify-logout.service';
import { ViewUserBundle } from '../../models/ViewUserBundle';
import { NgForm } from '@angular/forms';
import { DirectMessageDTO } from '../../models/dto/directMessageDTO';
import { DirectMessage } from '../../models/Directmessage';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-view-user-profile',
  templateUrl: './view-user-profile.component.html',
  styleUrls: ['./view-user-profile.component.css']
})
export class ViewUserProfileComponent implements OnInit {

  /* Viewing Users information */
  logInStatus: Boolean = false;
  viewUserName: string;
  viewUserId: string;
  userEntityInformation: ViewUserBundle;
  /* Direct Message with active user */
  dmList: DirectMessage[];
  conversation: DirectMessage[];
  /* User Profile Pic */
  dbImage: any;
  /* Post History */
  forumPost: any = [];
  /* HTML booleans */
  noError: boolean = true;
  showDmHistory = true;

  constructor(private activatedRoute: ActivatedRoute,
              private router: Router, 
              private viewUser: ViewUserService,
              private verifyService: VerifyLogoutService,
              private http: HttpClient) {
   }

  ngOnInit() {
    this.logInStatus = this.verifyService.verifyLoggedIn();
    /* This method pulls the parameters of the activated route and converts them into a usable string */
    this.activatedRoute.paramMap.subscribe(params => {
    this.viewUserName = params.get('userName');
    this.viewUserId = params.get('id');
    });

    this.viewUser.redirectWhenViewingSelf(this.viewUserName);

    /* This method gets a bundle of information I want to display on the view user page */
    this.viewUser.getViewUserBundleByUserName(this.viewUserName).subscribe((data: ViewUserBundle) => {
      this.userEntityInformation = data;
    })
    /* Get Direct Message history with active user */
    this.viewUser.getDmHistoryDirectMessages(this.viewUserId).subscribe((response: DirectMessage[]) => {
        this.dmList =response
    })
    /* Get other users profile picture */
    this.http.get('http://localhost:8080/user/userProfileImage/' + this.viewUserId).subscribe((response: any) => {
      if (response.message) {
        console.log(response.message);
        return;
      } else {
        this.dbImage = 'data:image/jpeg;base64,' + response.image;
      }
    })
    /* Get user post history with hiddenpost removed */
    this.http.get('http://localhost:8080/user/getUpdatedPostHistoryViewUser/' + this.viewUserId).subscribe((response) => {
      this.forumPost = response;
    })
  
  }

  viewingUserSendDM(dmMessageDetails: NgForm) {
    let sendDirectMessage: DirectMessageDTO = {
      receivedByUserId: this.userEntityInformation.viewUser.id,
      receivedByUserName: this.userEntityInformation.viewUser.userName,
      sentByUserId: localStorage.getItem('id'),
      sentByUserName: localStorage.getItem('userName'),
      messageContent: dmMessageDetails.value.messageContent
    }

    if (sendDirectMessage.messageContent.length < 3) {
      this.noError = false;
      return;
    } 

    this.viewUser.postDirectMessage(sendDirectMessage).subscribe();
    // location.reload();
  }

  displayConversation( userDms: UserEntity) {
    this.conversation = [];
    console.log(`${localStorage.getItem('userName')} is viewing and messaging ${userDms.userName}`)
    
    for (let i = 0; i < this.dmList.length; i++) {
      if (localStorage.getItem('userName') === this.dmList[i].sentByUserName && userDms.userName === this.dmList[i].receivedByUserName) {
        this.conversation.push(this.dmList[i]);
      } else if (localStorage.getItem('userName') === this.dmList[i].receivedByUserName && userDms.userName === this.dmList[i].sentByUserName) {
        this.conversation.push(this.dmList[i]);
      }
    }
    this.conversation.reverse();
    this.showDmHistory = false;
  }


  logOut() {
    localStorage.removeItem('userName');
    localStorage.removeItem('id')
    this.logInStatus = false;
    this.router.navigate(["/login"])
    return;
  }

}
