import axios from "axios";
import { defineStore } from "pinia";

const origin = "http://localhost:5000";
// const origin = "https://chat-app-pg8h.onrender.com";

import { Loading, Notify, Report } from "notiflix";

Notify.init({ clickToClose: true });

export const useAppStore = defineStore("app", {
	state() {
		return {
			userInfo: "",
			profileModal: {
				openModal: false,
				display: "none",
			},
			groupModal: {
				openModal: false,
				display: "none",
			},
			openSideBar: false,
			chatList: [],
			userList: null,
			selectedChat: {},
			selectedChatId: 0,
			selectedUserToAdd: [],
		};
	},
	getters: {},
	actions: {
		errorHandler(error) {
			Report.failure("Error", error.response.data.message, "Aww");
			Loading.remove();
		},
		setUserInfo() {
			const userInfo = JSON.parse(localStorage.getItem("userInfo"));
			this.userInfo = userInfo;
		},
		async handleLogin(loginData) {
			try {
				Loading.circle();

				const { data } = await axios({
					method: "POST",
					url: origin + "/api/user/login",
					data: loginData,
				});

				Notify.success("Login Success");

				localStorage.setItem("userInfo", JSON.stringify(data));

				this.router.push("/");
				Loading.remove();
			} catch (error) {
				this.errorHandler(error);
			}
		},

		async handleRegister(name, email, password, pic) {
			try {
				Loading.circle();
				const { data } = await axios({
					method: "POST",
					url: origin + "/api/user",
					data: {
						name,
						email,
						password,
						pic,
					},
				});

				Notify.success("Registration Success");

				localStorage.setItem("userInfo", JSON.stringify(data));
				this.router.push("/");
				Loading.remove();
			} catch (error) {
				this.errorHandler(error);
			}
		},

		async UpdateProfilePic(pic) {
			try {
				await axios({
					method: "PUT",
					url: origin + "/api/user",
					data: { pic },
					headers: {
						authorization:
							"Bearer " +
							JSON.parse(localStorage.getItem("userInfo")).token,
					},
				});

				this.userInfo.pic = pic;
			} catch (error) {
				this.errorHandler(error);
			}
		},

		async fetchChatList() {
			try {
				Loading.circle();
				const { data } = await axios({
					method: "GET",
					url: origin + `/api/chat`,
					headers: {
						authorization:
							"Bearer " +
							JSON.parse(localStorage.getItem("userInfo")).token,
					},
				});
				this.chatList = data;
				Loading.remove();
			} catch (error) {
				this.errorHandler(error);
				console.log(error);
			}
		},

		async searchUsers(search) {
			try {
				Loading.circle();
				const { data } = await axios({
					method: "GET",
					url: origin + "/api/user?search=" + search,
					headers: {
						authorization:
							"Bearer " +
							JSON.parse(localStorage.getItem("userInfo")).token,
					},
				});
				this.userList = data;
				Loading.remove();
			} catch (error) {
				Loading.remove();
				this.errorHandler(error);
			}
		},

		async accessChat(id) {
			try {
				Loading.circle();
				const { data } = await axios({
					method: "POST",
					url: origin + "/api/chat",
					headers: {
						authorization:
							"Bearer " +
							JSON.parse(localStorage.getItem("userInfo")).token,
					},
					data: {
						userId: id,
					},
				});
				this.selectedChat = data;
				// console.log(this.chatList.find(selectedChat));
				if (
					this.chatList.find((c) => c._id === this.selectedChat._id)
				) {
					this.chatList.unshift(this.selectedChat);
				}

				console.log(this.selectedChat);
				Loading.remove();
			} catch (error) {
				Loading.remove();
				this.errorHandler(error);
			}
		},

		async chooseUserToAdd(id) {
			const { data } = await axios({
				method: "GET",
				url: origin + `/api/user/${id}`,
			});

			this.selectedUserToAdd.push(data);
		},

		getSenderName(chat) {
			if (chat.chatName !== "sender") {
				return chat.chatName;
			}
			let users = chat.users;
			for (let user of users) {
				if (user.name !== this.userInfo.name) {
					return user.name;
				}
			}
		},

		toggleSidebar() {
			this.openSideBar = !this.openSideBar;
		},

		toggleProfileModal() {
			this.profileModal.openModal = !this.profileModal.openModal;
			if (this.profileModal.display === "none") {
				this.profileModal.display = "block";
			} else {
				this.profileModal.display = "none";
				this.userList = null;
			}
		},

		toggleGroupModal() {
			this.groupModal.openModal = !this.groupModal.openModal;
			if (this.groupModal.display === "none") {
				this.groupModal.display = "block";
			} else {
				this.groupModal.display = "none";
				this.userList = null;
			}
		},

		logout() {
			localStorage.clear();
			this.router.push("/login");
		},
	},
});
