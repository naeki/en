En::Application.routes.draw do
  get "home/index"

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):

  resources :posts do
    collection do
      get    :digest, :feed, :bookmarks
      get    :tags      , to: 'posts#get_tags'
      get    :comments  , to: 'posts#get_comments'
      get    :likes     , to: 'posts#get_likes'
      get    :find      , to: 'posts#find'
      post   :picture   , to: 'posts#upload_picture'
      delete :picture   , to: 'posts#delete_picture'

      get    '/all/new' , to: 'posts#all_new'
      get    '/all/pop' , to: 'posts#all_pop'
    end
    member do
      put :add_tags, :remove_tag
    end
    resources :comments
  end

  resources :sessions, only: [:new, :create, :destroy] do
    collection do
      post '/auth' , to: 'sessions#auth'
      get :get_current_user
    end
  end

  resources :relationships, only: [:create, :destroy]
  resources :likes, only: [] do
    collection do
      post   :create
      delete :destroy
    end
  end
  resources :bookmarks, only: [] do
    collection do
      post   :create
      delete :destroy
    end
  end

  resources :digest_settings, only: [] do
    collection do
      post   :add_tag
      delete :remove_tag
      get    :get_tags           #Вроде неплохо и как щас получать настройки вместе с юзером
    end
  end


  get '/tags'               => 'tags#show'


  get '/users/all'          => 'users#index'
  get '/users/find'         => 'users#show'
  get '/users/posts'        => 'users#posts'
  get '/users/likes'        => 'users#likes'
  get '/users/followers'    => 'users#followers'
  get '/users/following'    => 'users#following'


  post '/register'          => 'users#create'
  post '/users/photo'       => 'users#upload_photo'

  put '/users'              => 'users#update'

  delete '/users/photo'     => 'users#delete_photo'

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  #match "/*path", to: "home#index"

  get    "/signup",     to: "users#new",          via: 'get'
  # get    "/signin",     to: "sessions#new",       via: 'get'
  delete "/signout",    to: "sessions#destroy"

  get "/digest",        to: "home#enter"
  get "/feed",          to: "home#enter"
  get "/all",           to: "home#enter"
  get "/search",        to: "home#enter"
  get "/all/popular",   to: "home#enter"
  get "/bookmarks",     to: "home#enter"
  get "/users",         to: "home#enter"
  get "/new",           to: "home#enter"
  get "/edit",          to: "home#enter"
  get "/:id",           to: "home#post", constraints: {id: /\d\d*/}
  get "/:id/:path",     to: redirect("/%{id}"), constraints: {id: /\d\d*/}

  get "/:id/followers", to: "home#user", constraints: {id: /user\d*/}
  get "/:id/following", to: "home#user", constraints: {id: /user\d*/}
  get "/:id/likes",     to: "home#user", constraints: {id: /user\d*/}
  get "/:id/posts",     to: "home#user", constraints: {id: /user\d*/}
  get "/:id/deleted",   to: "home#user", constraints: {id: /user\d*/}
  get "/:id",           to: "home#user", constraints: {id: /user\d*/}
  get "/:id/:path",     to: redirect("/%{id}"), constraints: {id: /user\d*/}

  get "/:id",           to: "home#enter", constraints: {id: /tag\d*/}

  #match "/:id/:page",     to: "home#nf"
  #match "/:id",           to: "home#nf"
  #match "/nf",            to: "home#nf"

  root to: "home#index"

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
