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
      get :digest, :all, :feed
    end
    member do
      put :add_tags, :remove_tag
    end
    resources :comments
  end

  resources :sessions, only: [:new, :create, :destroy] do
    collection do
      get :get_current_user
    end
  end

  resources :relationships, only: [:create, :destroy]

  get '/users/all'                     => 'users#index'
  get '/users/:id(.:format)'           => 'users#show'
  get '/users/:id/feed(.:format)'      => 'users#feed'
  get '/users/:id/posts(.:format)'     => 'users#posts'
  get '/users/:id/followers(.:format)' => 'users#followers'
  get '/users/:id/following(.:format)' => 'users#following'

  post '/register'                     => 'users#create'

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

  match "/signup",        to: "users#new",        via: 'get'
  match "/signin",        to: "sessions#new",     via: 'get'
  match "/signout",       to: "sessions#destroy", via: 'delete'

  match "/digest",        to: "home#enter"
  match "/feed",          to: "home#enter"
  match "/all",           to: "home#enter"
  match "/users",         to: "home#enter"
  match "/new",           to: "home#enter"
  match "/edit",          to: "home#enter"
  match "/:id",           to: "home#post", constraints: {id: /\d*/}

  match "/:id/followers", to: "home#user"
  match "/:id/following", to: "home#user"
  match "/:id/posts",     to: "home#user"
  match "/:id",           to: "home#user", constraints: {id: /user\d*/}

  match "/:id/:page",     to: "home#nf"
  match "/:id",           to: "home#nf"
  match "/nf",            to: "home#nf"

  root to: "home#index"

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
